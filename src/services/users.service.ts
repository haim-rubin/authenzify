import { sign } from 'jsonwebtoken'
import { SIGN_UP_ERRORS, SIGN_IN_ERRORS } from '../errors/error-codes'
import HttpError from '../errors/HttpError'
import { IUser, IUserClean } from '../interfaces/IUser'
import { IUsersService, IDalUsersService } from '../interfaces'
import {
  TPassword,
  TPasswordInfo,
  TSignUp,
  TUserDetails,
  TEmail,
  TSignInEmail,
} from '../types'
import { encrypt, getSaltHex, doesPasswordMatch } from '../util/encryption'
import { ConfigService } from './config.service'
import { IUsersServiceEmitter } from '../interfaces/IUsersService'
import { emitter } from './emitter'
import { UsersServiceEvents } from '../events/users-service.events'
const algorithm = 'RS512'

export class UsersService implements IUsersService, IUsersServiceEmitter {
  #config
  #iDalUsersService

  constructor(config: ConfigService, iDalUsersService: IDalUsersService) {
    this.#config = config
    this.#iDalUsersService = iDalUsersService
  }
  async signIn(credentials: TSignInEmail): Promise<String> {
    const user = await this.findOne({ email: credentials.email })

    if (!user) {
      throw new HttpError(SIGN_IN_ERRORS.USER_NOT_EXIST)
    }

    const { email, firstName, lastName, username, isValid, isDeleted } = user

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
    })

    if (!isMatch) {
      throw new HttpError(SIGN_IN_ERRORS.INVALID_USERNAME_OR_PASSWORD)
    }

    const token = sign(
      {
        email,
        firstName,
        lastName,
        username,
      },
      this.#config.privateKey,
      { algorithm },
    )

    return token
  }

  onSignUp(onSignUpFunction: Function): void {
    emitter.addListener(
      UsersServiceEvents.USER_SIGN_UP,
      onSignUpFunction as any,
    )
  }

  onSignUpError(onSignUpFunction: Function): void {
    emitter.addListener(
      UsersServiceEvents.USER_SIGN_UP_ERROR,
      onSignUpFunction as any,
    )
  }

  onSignIn(user: IUserClean): void {
    throw new Error('Method not implemented.')
  }

  async isUsernamePolicyValid({ email }: { email: TEmail }) {
    return new RegExp(this.#config.usernamePolicy).test(email)
  }

  async isPasswordPolicyValid({ password }: { password: TPassword }) {
    return new RegExp(this.#config.passwordPolicy).test(password)
  }

  async encrypt({ password }: { password: TPassword }): Promise<TPasswordInfo> {
    const salt = getSaltHex(this.#config.saltLength)

    const passwordEncrypted = await encrypt({
      expression: password,
      salt,
      passwordPrivateKey: this.#config.passwordPrivateKey,
    })

    return {
      password: passwordEncrypted,
      salt,
    }
  }

  async create(userDetails: TUserDetails) {
    return this.#iDalUsersService.create(userDetails)
  }

  async findOne({ email }: { email: TEmail }): Promise<IUser> {
    return this.#iDalUsersService.findOne({ email })
  }

  async signUp(userDetails: TSignUp): Promise<IUserClean> {
    try {
      const { email, password } = userDetails
      const usernamePolicyIsValid = await this.isUsernamePolicyValid({ email })
      if (!usernamePolicyIsValid) {
        throw new HttpError(SIGN_UP_ERRORS.INVALID_USERNAME_POLICY)
      }

      const passwordPolicyIsValid = await this.isPasswordPolicyValid({
        password,
      })
      if (!passwordPolicyIsValid) {
        throw new HttpError(SIGN_UP_ERRORS.INVALID_PASSWORD_POLICY)
      }

      const exists = await this.findOne({ email })

      if (exists) {
        throw new HttpError(SIGN_UP_ERRORS.USER_ALREADY_EXISTS)
      }

      const encryptedPassword = await this.encrypt({ password })

      const user = await this.create({
        ...userDetails,
        ...encryptedPassword,
        isValid: this.#config.verifyUserAuto,
      })
      const userClean: IUserClean = user
      emitter.emit(UsersServiceEvents.USER_SIGN_UP, userClean)
      return userClean
    } catch (error) {
      emitter.emit(UsersServiceEvents.USER_SIGN_UP_ERROR, error)
      throw error
    }
  }
}
