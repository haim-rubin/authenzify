import { sign, verify } from 'jsonwebtoken'
import { VERIFICATION_TYPES } from '../../constant'
import { SIGN_IN_ERRORS, SIGN_UP_ERRORS } from '../../errors/error-codes'
import HttpError from '../../errors/HttpError'
import { USERS_SERVICE_EVENTS } from '../../events/users-service.events'
import {
  IUser,
  IUserClean,
  IUserMinimal,
  IVerification,
} from '../../interfaces/IUser'
import {
  IUserServiceEncryption,
  IUserServiceValidation,
  IUsersManagementService,
  IUsersServiceEmitter,
  IVerificationsService,
} from '../../interfaces/IUsersService'
import { ConfigService } from '../../services/config.service'
import { emitter } from '../../services/emitter'
import {
  Services,
  TPassword,
  TPasswordInfo,
  TSignInEmail,
  TSignUp,
  TVerificationDetails,
} from '../../types'
import { doesPasswordMatch, encrypt, getSaltHex } from '../../util/encryption'
import { addEmailsNotificationsListeners } from '../factories/email-notifications/add-emails-notifications-listeners'

const mapToMinimal = (user: IUserClean): IUserClean => {
  const { username, firstName, lastName, email, id, isDeleted, isValid } = user
  const userMinimal: IUserClean = {
    username,
    firstName,
    lastName,
    email,
    id,
    isDeleted,
    isValid,
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

  async innerSignUp(userDetails: TSignUp): Promise<IUserMinimal> {
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

      const user = await this.#services.Users.create({
        ...userDetails,
        ...encryptedPassword,
        isValid: this.#configService.activateUserAuto,
      })

      const userClean: IUserMinimal = mapToMinimal(user)

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

  async verifyUser(user: IUser, verification: IVerification): Promise<any> {
    const res = await this.#services.Users.verifyUser(user, verification)
    return res
  }

  createVerification(
    verificationDetails: TVerificationDetails,
  ): Promise<IVerification> {
    return this.#services.Verifications.createVerification(verificationDetails)
  }

  async getUser({ id }: { id: string }): Promise<IUser> {
    return this.#services.Users.findById(id)
  }

  async signUp(userDetails: TSignUp): Promise<IUserMinimal> {
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

    const { id, email, firstName, lastName, username, isValid, isDeleted } =
      user

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

    const res = await this.#services.Users.verifyUser(
      user as IUser,
      verification,
    )
    return true
  }

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
    throw new Error('Method not implemented.')
  }
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
