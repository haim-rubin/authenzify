import { sign, verify } from 'jsonwebtoken'

import { VERIFICATION_TYPES } from '../../constant'
import {
  PERMISSIONS_ERRORS,
  SIGN_IN_ERRORS,
  SIGN_UP_ERRORS,
} from '../../errors/error-codes'
import HttpError from '../../errors/HttpError'
import { USERS_SERVICE_EVENTS } from '../../events/users-service.events'
import { IUserClean } from '../../interfaces/IUser'
import { IVerification } from '../../interfaces/IVerificationService'
import {
  IUserServiceEncryption,
  IUserServiceValidation,
  IUsersManagementService,
  IUsersServiceEmitter,
} from '../../interfaces/IUsersService'
import { IVerificationsService } from '../../interfaces/IVerificationService'
import { ConfigService } from '../../services/config.service'
import { emitter } from '../../services/emitter'
import {
  Services,
  TPassword,
  TPasswordInfo,
  TPermission,
  TPermissionsGroup,
  TSignInEmail,
  TSignUp,
  TVerificationDetails,
} from '../../types'
import { doesPasswordMatch, encrypt, getSaltHex } from '../../util/encryption'
import { addEmailsNotificationsListeners } from '../factories/email-notifications/add-emails-notifications-listeners'
import {
  IPermission,
  IPermissionBase,
} from '../../interfaces/IPermissionService'
import {
  generatePermissionsGroupId,
  generateTenantId,
} from '../../util/record-id-prefixes'

const mapToMinimal = (user: IUserClean): IUserClean => {
  const {
    username,
    firstName,
    lastName,
    email,
    id,
    isDeleted,
    isValid,
    permissions,
    permissionsGroups,
  } = user
  const userMinimal: IUserClean = {
    username,
    firstName,
    lastName,
    email,
    id,
    isDeleted,
    isValid,
    permissions,
    permissionsGroups,
  }
  return userMinimal
}
export class UsersManagement
  implements
    IUsersServiceEmitter,
    IVerificationsService,
    IUserServiceEncryption,
    IUserServiceValidation,
    IUsersManagementService
{
  #services: Services
  #configService: ConfigService
  constructor({
    services,
    configService,
  }: {
    services: Services
    configService: ConfigService
  }) {
    this.#services = services
    this.#configService = configService
  }

  doesUsernamePolicyValid({ email }: { email: string }): Promise<Boolean> {
    return Promise.resolve(this.#configService.doesUsernamePolicyValid(email))
  }

  doesPasswordPolicyValid({
    password,
  }: {
    password: string
  }): Promise<boolean> {
    return Promise.resolve(
      this.#configService.doesPasswordPolicyValid(password),
    )
  }

  async encrypt({ password }: { password: TPassword }): Promise<TPasswordInfo> {
    const salt = getSaltHex(this.#configService.saltLength)

    const passwordEncrypted = await encrypt({
      expression: password,
      salt,
      passwordPrivateKey: this.#configService.passwordPrivateKey,
    })

    return {
      password: passwordEncrypted,
      salt,
    }
  }

  async innerSignUp(userDetails: TSignUp): Promise<IUserClean> {
    try {
      const { email, password } = userDetails
      const usernamePolicyIsValid =
        await this.#configService.doesUsernamePolicyValid(email)
      if (!usernamePolicyIsValid) {
        throw new HttpError(SIGN_UP_ERRORS.INVALID_USERNAME_POLICY)
      }

      const passwordPolicyIsValid =
        await this.#configService.doesPasswordPolicyValid(password)

      if (!passwordPolicyIsValid) {
        throw new HttpError(SIGN_UP_ERRORS.INVALID_PASSWORD_POLICY)
      }

      const exists = await this.#services.Users.findOne({ email })

      if (exists) {
        throw new HttpError(SIGN_UP_ERRORS.USER_ALREADY_EXISTS)
      }

      const encryptedPassword = await this.encrypt({ password })
      const defaultPermissionsSignUp =
        await this.#services.Permissions.findPermissions({ isBase: true })
      const user = await this.#services.Users.create({
        ...userDetails,
        ...encryptedPassword,
        isValid: this.#configService.activateUserAuto,
        permissions: defaultPermissionsSignUp.map(({ name }) => name),
      })

      const userClean: IUserClean = mapToMinimal(user)

      return userClean
    } catch (error) {
      throw error
    }
  }

  verifyToken(token): any {
    const decoded = verify(
      token,
      this.#configService.publicKey,
      this.#configService.jwtVerifyOptions,
    )
    return decoded
  }

  async verifyUser(
    user: IUserClean,
    verification: IVerification,
  ): Promise<any> {
    const res = await this.#services.Users.verifyUser(user, verification)
    return res
  }

  createVerification(
    verificationDetails: TVerificationDetails,
  ): Promise<IVerification> {
    return this.#services.Verifications.createVerification(verificationDetails)
  }

  async getUser({ id }: { id: string }): Promise<IUserClean> {
    const user = await this.#services.Users.findById(id)
    const {
      id: uid,
      email,
      firstName,
      lastName,
      username,
      isValid,
      isDeleted,
      tenantId,
      permissions,
      permissionsGroups,
    } = user

    return {
      id: uid,
      email,
      firstName,
      lastName,
      username,
      isValid,
      isDeleted,
      tenantId,
      permissions,
      permissionsGroups,
    }
  }

  async signUp(userDetails: TSignUp): Promise<IUserClean> {
    try {
      const user = await this.innerSignUp(userDetails)
      emitter.emit(USERS_SERVICE_EVENTS.USER_SIGN_UP, user)
      return user
    } catch (error) {
      emitter.emit(USERS_SERVICE_EVENTS.USER_SIGN_UP_ERROR, error)
      throw error
    }
  }

  async innerSignIn(credentials: TSignInEmail): Promise<string> {
    const user = await this.#services.Users.findOne({
      email: credentials.email,
    })

    if (!user) {
      throw new HttpError(SIGN_IN_ERRORS.USER_NOT_EXIST)
    }

    const {
      id,
      email,
      firstName,
      lastName,
      username,
      isValid,
      isDeleted,
      permissions,
    } = user

    if (isDeleted) {
      throw new HttpError(SIGN_IN_ERRORS.USER_DELETED)
    }

    if (!isValid) {
      throw new HttpError(SIGN_IN_ERRORS.USER_NOT_VERIFIED)
    }

    const isMatch = await doesPasswordMatch({
      password: credentials.password,
      encryptedPassword: user.password,
      salt: user.salt,
      passwordPrivateKey: this.#configService.passwordPrivateKey,
    })

    if (!isMatch) {
      throw new HttpError(SIGN_IN_ERRORS.INVALID_USERNAME_OR_PASSWORD)
    }

    const token = sign(
      {
        id,
        email,
        firstName,
        lastName,
        username,
        permissions,
      },
      this.#configService.privateKey,
      this.#configService.jwtSignOptions,
    )

    return token
  }

  async signIn(credentials: TSignInEmail): Promise<string> {
    try {
      const token = await this.innerSignIn(credentials)
      emitter.emit(USERS_SERVICE_EVENTS.USER_SIGN_IN, token)
      return token
    } catch (error) {
      emitter.emit(USERS_SERVICE_EVENTS.USER_SIGN_IN_ERROR, error)
      throw error
    }
  }

  verifyActivation = async (verificationId: string): Promise<boolean> => {
    const verification = await this.#services.Verifications.findOne({
      _id: verificationId,
      type: VERIFICATION_TYPES.SIGN_UP,
      isDeleted: false,
    })

    if (!verification) {
      throw new HttpError(SIGN_UP_ERRORS.INVALID_ACTION)
    }

    if (verification.isDeleted) {
      throw new HttpError(SIGN_UP_ERRORS.INVALID_ACTION)
    }

    const user = await this.getUser({ id: verification.userId })

    if (!user) {
      throw new HttpError(SIGN_UP_ERRORS.USER_DOES_NOT_EXISTS)
    }

    if (user.isDeleted) {
      throw new HttpError(SIGN_UP_ERRORS.USER_DOES_NOT_EXISTS)
    }

    const res = await this.#services.Users.verifyUser(user, verification)
    return true
  }

  //#region Permissions
  async addPermission(permission: TPermission) {
    const createResponse = await this.#services.Permissions.createPermission(
      permission,
    )
    return createResponse
  }

  async addPermissionsGroup(permissionGroup: TPermissionsGroup) {
    const createResponse =
      await this.#services.Permissions.createPermissionsGroup(permissionGroup)
    return createResponse
  }

  async deletePermission({ id }: { id: string }) {
    const deleteResponse = await this.#services.Permissions.deletePermission({
      id,
    })
    return deleteResponse
  }

  async deletePermissionsGroup({
    tenantId,
    id,
  }: {
    tenantId: string
    id: string
  }) {
    const deleteResponse =
      await this.#services.Permissions.deletePermissionsGroup({ tenantId, id })
    return deleteResponse
  }

  async getPermission({ id }: { id: string }): Promise<TPermission> {
    const permission = await this.#services.Permissions.findPermission({
      id,
    })

    return permission
  }

  async getPermissionByName({ name }: { name: string }): Promise<TPermission> {
    const permission = await this.#services.Permissions.findPermissionByName({
      name,
    })

    return permission
  }

  async getPermissions(filter: any): Promise<IPermission[]> {
    const permissions = await this.#services.Permissions.findPermissions(filter)
    return permissions
  }

  async getPermissionsGroup({
    tenantId,
    id,
  }: {
    tenantId: string
    id: string
  }): Promise<TPermissionsGroup> {
    const permissionsGroup =
      await this.#services.Permissions.findPermissionsGroup({
        tenantId,
        id,
      })

    return permissionsGroup
  }

  async getPermissionsGroups({
    tenantId,
    filter,
  }: {
    tenantId: string
    filter?: any
  }): Promise<TPermissionsGroup[]> {
    const permissionsGroups =
      await this.#services.Permissions.findPermissionsGroups({
        tenantId,
        filter,
      })
    return permissionsGroups
  }

  async initializePermissions(permissions: IPermissionBase[]) {
    return this.#services.Permissions.initializePermissions(permissions)
  }

  async createPermissionsGroupsForNewCompany({
    tenantId,
  }: {
    tenantId: string
  }) {
    const existing = await this.getPermissionsGroups({ tenantId })
    const existingNames = existing.map(({ name }) => name)
    const createPermissionsGroupsResponse = await Promise.all(
      Object.entries(this.#configService.permissionsGroups)
        .filter(([name]) => !existingNames.includes(name))
        .map(([name, permissions]: [string, string[]]) => {
          return this.addPermissionsGroup({
            id: generatePermissionsGroupId(),
            tenantId,
            name,
            isDeleted: false,
            permissions,
          })
        }),
    )
    return createPermissionsGroupsResponse
  }

  async requestPermissionForUser({ id, companyDetails, userInfo }) {
    if (userInfo.id !== id) {
      throw new HttpError(
        PERMISSIONS_ERRORS.PERMISSION_CANNOT_INITIATE_BY_OTHER_USER,
      )
    }
    const user = await this.getUser({ id })
    if (userInfo.email !== user.email) {
      throw new HttpError(PERMISSIONS_ERRORS.INVALID_INITIATOR_EMAIL)
    }

    if (userInfo.email === companyDetails.email && !user.tenantId) {
      // Case is the first user
      const tenantId = generateTenantId()
      const updatedUserResponse = await this.#services.Users.updateUser(
        { id },
        { tenantId },
      )

      const permissionsGroups = await this.createPermissionsGroupsForNewCompany(
        { tenantId },
      )
    }

    const userWithTenantId = await this.getUser({ id })
    const permissionsGroups = await this.getPermissionsGroups({
      tenantId: userWithTenantId.tenantId,
      filter: {},
    })

    const verification = await this.createVerification({
      userId: id,
      type: VERIFICATION_TYPES.PERMISSIONS,
    })
    emitter.emit(USERS_SERVICE_EVENTS.USER_PERMISSIONS_REQUESTED, {
      permissionsGroups,
      verification,
      user,
      adminEmail: companyDetails.email,
    })
  }
  //#endregion

  //#region Events
  onSignUp(onSignUpFunction: Function): void {
    emitter.addListener(
      USERS_SERVICE_EVENTS.USER_SIGN_UP,
      onSignUpFunction as any,
    )
  }

  onSignUpError(onSignUpFunction: Function): void {
    emitter.addListener(
      USERS_SERVICE_EVENTS.USER_SIGN_UP_ERROR,
      onSignUpFunction as any,
    )
  }

  onSignIn(onSignInFunction: Function): void {
    emitter.addListener(
      USERS_SERVICE_EVENTS.USER_SIGN_IN,
      onSignInFunction as any,
    )
  }

  onPermissionsRequested(onPermissionsRequestedFunction: Function): void {
    emitter.addListener(
      USERS_SERVICE_EVENTS.USER_PERMISSIONS_REQUESTED,
      onPermissionsRequestedFunction as any,
    )
  }
  //#endregion Events
}

export const initUsersManagement = async ({
  services,
  configService,
}: {
  services: Services
  configService: ConfigService
}) => {
  const usersManagement = new UsersManagement({
    services,
    configService,
  })

  await addEmailsNotificationsListeners({ configService, usersManagement })

  return usersManagement
}
