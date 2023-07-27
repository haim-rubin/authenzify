import { sign, verify } from 'jsonwebtoken'

import { VERIFICATION_TYPES } from '../../constant'
import {
  CHANGE_PASSWORD_ERRORS,
  FORGOT_PASSWORD_ERRORS,
  PERMISSIONS_ERRORS,
  SIGN_IN_ERRORS,
  SIGN_UP_ERRORS,
} from '../../errors/error-codes'
import HttpError from '../../errors/HttpError'
import { USERS_SERVICE_EVENTS } from '../../events/users-service.events'
import { IUser, IUserClean } from '../../interfaces/IUser'
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
import { unique } from '../../util/helpers'

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

  mapUser(user) {
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
  async getUser({ id }: { id: string }): Promise<IUserClean> {
    const user = await this.#services.Users.findById(id)
    return user ? this.mapUser(user) : user
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
  async getUserPermissions({ tenantId, permissions, permissionsGroups }) {
    const permissionsGroupsFull =
      await this.#services.Permissions.findPermissionsGroupsByNames({
        tenantId,
        names: permissionsGroups,
      })

    const permissionsFromGroups = permissionsGroupsFull
      .map(({ permissions }) => permissions)
      .flat()
      .map(({ name }) => name)

    const allPermissionsUnique = []
      .concat(permissionsFromGroups)
      .concat(permissions)
      .filter(unique)

    return allPermissionsUnique
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
      tenantId,
      permissionsGroups,
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
    const allPermissions = await this.getUserPermissions({
      tenantId,
      permissions,
      permissionsGroups,
    })
    const token = sign(
      {
        id,
        email,
        firstName,
        lastName,
        username,
        tenantId,
        permissions: allPermissions,
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
      id: verificationId,
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

  async changePassword({ password, newPassword, userInfo }) {
    if (!password?.trim() || !newPassword?.trim()) {
      throw new HttpError(CHANGE_PASSWORD_ERRORS.INVALID_PASSWORD_POLICY)
    }

    const user = await this.#services.Users.findOne({
      email: userInfo.email,
    })

    if (!user) {
      throw new HttpError(CHANGE_PASSWORD_ERRORS.USER_NOT_EXIST)
    }

    if (user.isDeleted) {
      throw new HttpError(CHANGE_PASSWORD_ERRORS.USER_NOT_EXIST)
    }

    if (!user.isValid) {
      throw new HttpError(CHANGE_PASSWORD_ERRORS.USER_NOT_EXIST)
    }

    const isMatch = await doesPasswordMatch({
      password: password,
      encryptedPassword: user.password,
      salt: user.salt,
      passwordPrivateKey: this.#configService.passwordPrivateKey,
    })

    if (!isMatch) {
      throw new HttpError(CHANGE_PASSWORD_ERRORS.INVALID_USERNAME_OR_PASSWORD)
    }

    const isNewPasswordMatch = await doesPasswordMatch({
      password: newPassword,
      encryptedPassword: user.password,
      salt: user.salt,
      passwordPrivateKey: this.#configService.passwordPrivateKey,
    })

    if (isNewPasswordMatch) {
      throw new HttpError(
        CHANGE_PASSWORD_ERRORS.CANNOT_CHANGE_TO_THE_EXISTING_PASSWORD,
      )
    }

    const passwordPolicyIsValid =
      await this.#configService.doesPasswordPolicyValid(newPassword)

    if (!passwordPolicyIsValid) {
      throw new HttpError(CHANGE_PASSWORD_ERRORS.INVALID_PASSWORD_POLICY)
    }

    const encryptedPassword = await this.encrypt({ password: newPassword })
    const updatedUser = await this.#services.Users.updateUser(
      { id: user.id },
      encryptedPassword,
    )
    return !!updatedUser?.modifiedCount
  }

  async forgotPassword({ email }) {
    const user = await this.#services.Users.findOne({
      email,
    })

    if (!user) {
      throw new HttpError(FORGOT_PASSWORD_ERRORS.USER_NOT_EXIST)
    }

    if (user.isDeleted) {
      throw new HttpError(FORGOT_PASSWORD_ERRORS.USER_DELETED)
    }

    if (!user.isValid) {
      throw new HttpError(FORGOT_PASSWORD_ERRORS.USER_NOT_EXIST)
    }

    const verification = await this.#services.Verifications.createVerification({
      userId: user.id,
      type: VERIFICATION_TYPES.RESET_PASSWORD_REQUEST,
      extraInfo: {},
    })

    const notRequestedVerification =
      await this.#services.Verifications.createVerification({
        userId: user.id,
        type: VERIFICATION_TYPES.DID_NOT_REQUESTED_TO_RESET_PASSWORD,
        extraInfo: {},
      })

    emitter.emit(USERS_SERVICE_EVENTS.RESET_PASSWORD_REQUESTED, {
      user,
      verification,
      notRequestedVerification,
    })
    return true
  }

  async applyForgotPassword({ verificationId, newPassword }) {
    const verification = await this.#services.Verifications.findOne({
      id: verificationId,
      type: VERIFICATION_TYPES.RESET_PASSWORD_REQUEST,
      isDeleted: false,
    })

    if (!verification || verification.isDeleted) {
      throw new HttpError(CHANGE_PASSWORD_ERRORS.INVALID_ACTION)
    }

    const { userId } = verification

    const user = await this.#services.Users.findById(userId)

    if (!user) {
      throw new HttpError(CHANGE_PASSWORD_ERRORS.USER_NOT_EXIST)
    }

    if (user.isDeleted) {
      throw new HttpError(CHANGE_PASSWORD_ERRORS.USER_NOT_EXIST)
    }

    if (!user.isValid) {
      throw new HttpError(CHANGE_PASSWORD_ERRORS.USER_NOT_EXIST)
    }

    const isMatch = await doesPasswordMatch({
      password: newPassword,
      encryptedPassword: user.password,
      salt: user.salt,
      passwordPrivateKey: this.#configService.passwordPrivateKey,
    })

    if (isMatch) {
      throw new HttpError(CHANGE_PASSWORD_ERRORS.INVALID_PASSWORD_POLICY)
    }

    const encryptedPassword = await this.encrypt({ password: newPassword })
    const updatedUser = await this.#services.Users.updateUser(
      { id: user.id },
      encryptedPassword,
    )
    await this.#services.Verifications.delete(verificationId)
    return !!updatedUser?.modifiedCount
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
      Object.entries(this.#configService.permissionsGroups) // Taking roles from config
        .filter(([name]) => !existingNames.includes(name)) // Filter the existing roles (this for case that application roles already sets and now adding new)
        .map(([name, { permissions }]: [string, { permissions: string[] }]) => {
          //Creating the roles that doesn't exists
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

  async combineAllUserPermissions(user) {
    const permissions = user.permissions || []
    const groupPermissions =
      user.permissionsGroups?.map(({ permissions }) => permissions).flat() || []
    return [].concat(permissions).concat(groupPermissions)
  }

  async throwIfNotAllowToApproveUsers({
    adminUser,
    user,
  }: {
    adminUser: IUserClean
    user: IUserClean
  }) {
    // Case of permission for approve user didn't defined by the application
    if (!this.#configService.approvePermissionsByPermissionsName) {
      throw new HttpError(
        PERMISSIONS_ERRORS.PERMISSION_FOR_APPROVE_USERS_NOT_DEFINED,
      )
    }

    const allAdminPermissions = await this.getUserPermissions({
      tenantId: adminUser.tenantId,
      permissions: adminUser.permissions,
      permissionsGroups: adminUser.permissionsGroups,
    })

    // In case it has the right permissions
    const hasTheRightPermissionToApprove = allAdminPermissions.includes(
      this.#configService.approvePermissionsByPermissionsName,
    )

    // Check the case if this is the first user's (doesIsCompanyInitializedUser) is asking permission,
    // in this case the user doesn't have yet the permission but he's the company owner user so he can approve himself
    if (!hasTheRightPermissionToApprove) {
      throw new HttpError(
        PERMISSIONS_ERRORS.PERMISSION_CANNOT_INITIATE_BY_OTHER_USER,
      )
    }

    return true
  }

  throwIfUserIsNotValid({ userInfo, user, id }) {
    if (userInfo.id !== id) {
      throw new HttpError(
        PERMISSIONS_ERRORS.PERMISSION_CANNOT_INITIATE_BY_OTHER_USER,
      )
    }

    if (!user) {
      throw new HttpError(PERMISSIONS_ERRORS.USER_DOES_NOT_EXISTS)
    }

    if (userInfo.email !== user.email) {
      throw new HttpError(PERMISSIONS_ERRORS.INVALID_INITIATOR_EMAIL)
    }
  }

  throwIfAdminUserIsNotValid({ adminUser }) {
    if (!adminUser || adminUser.isDeleted || !adminUser.isValid) {
      throw new HttpError(PERMISSIONS_ERRORS.ADMIN_USER_DOES_NOT_EXISTS)
    }
    return true
  }

  async initializeNewCompanyPermissions({ id }) {
    // Case is the first user
    const tenantId = generateTenantId()
    await this.createPermissionsGroupsForNewCompany({ tenantId })

    await this.#services.Users.updateUser(
      { id },
      {
        tenantId,
        doesIsCompanyInitializedUser: true,
        $push: {
          permissions: this.#configService.approvePermissionsByPermissionsName,
        },
      },
    )
  }

  doesItTheAdminRequestThePermissions({ user, adminEmail }) {
    return user.email === adminEmail
  }

  userRegisterAsNewCompany({ adminEmail, user }) {
    return (
      this.doesItTheAdminRequestThePermissions({ user, adminEmail }) &&
      !user.tenantId
    )
  }

  async getAvailablePermissionsForUser({ user, adminUser }) {
    const highestRoles = Object.entries(this.#configService.permissionsGroups)
      .filter(([role, value]: [role: string, value: any]) => value?.highest)
      .map(([name]) => ({ name }))

    const isTheFirstUser = user.email === adminUser.email
    if (isTheFirstUser) {
      return highestRoles
    }
    const permissionsGroups = await this.getPermissionsGroups({
      tenantId: adminUser.tenantId,
      filter: {},
    })
    return permissionsGroups
  }

  async createUserPermissionsVerification({ id, adminUser, user }) {
    const permissionsGroups = await this.getAvailablePermissionsForUser({
      user,
      adminUser,
    })

    const verificationExists = await this.#services.Verifications.findByUserId({
      id,
      type: VERIFICATION_TYPES.USER_PERMISSIONS_REQUEST,
      isDeleted: false,
    })

    if (verificationExists) {
      await this.#services.Verifications.delete(verificationExists.id)
    }
    const anonymousRoles = Object.entries(this.#configService.permissionsGroups)
      .filter(
        ([role, value]: [role: string, value: any]) => value.anonymousRole,
      )
      .map(([name]) => name)

    const verification = await this.createVerification({
      userId: id,
      type: VERIFICATION_TYPES.USER_PERMISSIONS_REQUEST,
      extraInfo: {
        adminEmail: adminUser.email,
        userEmail: user.email,
        permissionsGroups: permissionsGroups
          .filter(({ name }) => !anonymousRoles.includes(name))
          .map(({ name }) => name),
      },
    })
    return { verification, permissionsGroups }
  }

  async requestPermissionForUser({ id, companyDetails, userInfo }) {
    const user = await this.getUser({ id })
    this.throwIfUserIsNotValid({ userInfo, user, id })

    const { email: adminEmail } = companyDetails

    const adminUser = (await this.#services.Users.findOne({
      email: adminEmail,
    })) as IUserClean

    if (this.userRegisterAsNewCompany({ adminEmail, user })) {
      await this.initializeNewCompanyPermissions({ id })
    } else {
      await this.throwIfAdminUserIsNotValid({ adminUser })
      await this.throwIfNotAllowToApproveUsers({ adminUser, user })
    }

    const { verification, permissionsGroups } =
      await this.createUserPermissionsVerification({ id, adminUser, user })

    emitter.emit(USERS_SERVICE_EVENTS.USER_PERMISSIONS_REQUESTED, {
      permissionsGroups,
      verification,
      user,
      adminEmail: companyDetails.email,
    })
    return true
  }

  doesTheUserIsValid({ user }: { user: IUser }) {
    return user && !user.isDeleted && user.isValid
  }

  doesUserHasTheRightPermissionToApprove({ user }) {
    const { permissions, permissionsGroups = [] } = user
    const permissionsFromGroups = Object.entries(
      this.#configService.permissionsGroups,
    )
      .filter(([role]) => permissionsGroups.includes(role))
      .map(
        ([_, { permissions }]: [string, { permissions: any }]) => permissions,
      )
      .flat()
      .map(({ name }) => name)
    return []
      .concat(permissions)
      .concat(permissionsFromGroups)
      .includes(this.#configService.approvePermissionsByPermissionsName)
  }

  verifyUserPermissionRequest = async ({
    verificationId,
    role,
    userInfo,
  }): Promise<boolean> => {
    const verification = await this.#services.Verifications.findOne({
      id: verificationId,
      type: VERIFICATION_TYPES.USER_PERMISSIONS_REQUEST,
      isDeleted: false,
    })

    if (!verification || verification.isDeleted) {
      throw new HttpError(PERMISSIONS_ERRORS.INVALID_ACTION)
    }

    const {
      extraInfo: { adminEmail, userEmail, permissionsGroups },
    } = verification

    const user = await this.#services.Users.findOne({ email: userEmail })

    if (!permissionsGroups.includes(role)) {
      throw new HttpError(PERMISSIONS_ERRORS.ROLE_NOT_ALLOWED)
    }

    if (
      !this.doesTheUserIsValid({
        user,
      })
    ) {
      throw new HttpError(PERMISSIONS_ERRORS.USER_DOES_NOT_EXISTS)
    }
    const isUserAdminRequest = this.doesItTheAdminRequestThePermissions({
      user,
      adminEmail,
    })

    const adminUser = isUserAdminRequest
      ? user
      : await this.#services.Users.findOne({
          email: adminEmail,
        })

    if (userInfo.id !== adminUser.id) {
      throw new HttpError(PERMISSIONS_ERRORS.USER_NOT_ALLOWED)
    }

    // Check if the user that request the permissions doesn't have the right permission to approve
    if (!this.doesUserHasTheRightPermissionToApprove({ user })) {
      // If the user doesn't have the permissions so check if the user is also the admin
      // and if it does the admin so it's the same user and we shouldn't check again the permissions
      if (isUserAdminRequest) {
        throw new HttpError(PERMISSIONS_ERRORS.USER_NOT_ALLOWED)
      } else {
        // This is for the case the user is not the admin so we need to check if the admin has the permission for approve the user

        // First check existence of the admin user
        if (
          !this.doesTheUserIsValid({
            user: adminUser,
          })
        ) {
          throw new HttpError(PERMISSIONS_ERRORS.ADMIN_USER_DOES_NOT_EXISTS)
        }

        // Check if the adminUser has the right permission to approve the permissions for the user
        if (!this.doesUserHasTheRightPermissionToApprove({ user: adminUser })) {
          throw new HttpError(PERMISSIONS_ERRORS.USER_NOT_ALLOWED)
        }
      }
    }

    // Check if the requested role is exists this for making sure that the user didn't hack for role that it doesn't allow to
    const permissionsGroup =
      await this.#services.Permissions.findPermissionsGroups({
        tenantId: adminUser.tenantId,
        filter: { name: role },
      })

    if (!permissionsGroup.find(({ name }) => name === role)) {
      throw new HttpError(PERMISSIONS_ERRORS.ROLE_NOT_ALLOWED)
    }
    const deleteVerificationResponse =
      await this.#services.Verifications.delete(verificationId)

    const res = await this.#services.Users.updateUser(
      { id: user.id },
      {
        tenantId: user.tenantId || adminUser.tenantId, // Need to supports multi tenants
        permissionsGroups: permissionsGroup.map(({ name }) => name),
      },
    )

    emitter.emit(USERS_SERVICE_EVENTS.USER_PERMISSIONS_APPROVED, {
      user,
      adminUser,
    })
    return true
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

  onPermissionsApproved(onPermissionsApprovedFunction: Function): void {
    emitter.addListener(
      USERS_SERVICE_EVENTS.USER_PERMISSIONS_APPROVED,
      onPermissionsApprovedFunction as any,
    )
  }

  onForgotPassword(onForgotPasswordFunction: Function): void {
    emitter.addListener(
      USERS_SERVICE_EVENTS.RESET_PASSWORD_REQUESTED,
      onForgotPasswordFunction as any,
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
