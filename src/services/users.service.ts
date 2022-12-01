import { SIGN_UP_ERRORS } from '../errors/error-codes'
import HttpError from '../errors/HttpError'
import { IUser, IUserClean } from '../interfaces/IUser'
import { IUsersService, IDalUsersService } from '../interfaces'
import {
  TPassword,
  TPasswordInfo,
  TSignUp,
  TUserDetails,
  TEmail,
} from '../types'
import { encrypt, getSaltHex } from '../util/encryption'
import { ConfigService } from './config.service'
import { IUsersServiceEmitter } from '../interfaces/IUsersService'
import { emitter } from './emitter'
import { UsersServiceEvents } from '../events/users-service.events'
import { Model } from 'mongoose'

export class UsersService implements IUsersService, IUsersServiceEmitter {
  #config
  #iDalUsersService

  constructor(config: ConfigService, iDalUsersService: IDalUsersService) {
    this.#config = config
    this.#iDalUsersService = iDalUsersService
  }
  onSignUp(onSignUpFunction: Function): void {
    emitter.addListener(
      UsersServiceEvents.USER_SIGN_UP,
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
      privateKey: this.#config.privateKey,
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
    const { email, password } = userDetails
    const usernamePolicyIsValid = await this.isUsernamePolicyValid({ email })
    if (!usernamePolicyIsValid) {
      throw new HttpError(SIGN_UP_ERRORS.INVALID_USERNAME_POLICY)
    }

    const passwordPolicyIsValid = await this.isPasswordPolicyValid({ password })
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
  }
}
