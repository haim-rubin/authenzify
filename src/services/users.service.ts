import { SIGN_UP_ERRORS } from '../errors/error-codes'
import HttpError from '../errors/HttpError'
import { IUser, IUserClean } from '../interfaces/IUser'
import { IUsersService, IDalUsersService } from '../interfaces'
import {
  TPassword,
  TPasswordInfo,
  TSignUp,
  TUserDetails,
  TUsername,
} from '../types'
import { encrypt, getSaltHex } from '../util/ecryption'
import { ConfigService } from './config.service'

export class UsersService implements IUsersService {
  #config
  #iDalUserService

  constructor(config: ConfigService, iDalUserService: IDalUsersService) {
    this.#config = config
    this.#iDalUserService = iDalUserService
  }

  async isUsernamePolicyValid({ username }: { username: TUsername }) {
    return new RegExp(this.#config.usernamePolicy).test(username)
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

  async create({ username, password, isValid, salt }: TUserDetails) {
    return this.#iDalUserService.create({ username, password, isValid, salt })
  }

  async findOne({ username }: { username: TUsername }): Promise<IUser> {
    return this.#iDalUserService.findOne({ username })
  }

  async signUp({ username, password }: TSignUp): Promise<IUserClean> {
    const usernamePolicyIsValid = await this.isUsernamePolicyValid({ username })
    if (!usernamePolicyIsValid) {
      throw new HttpError(SIGN_UP_ERRORS.INVALID_USERNAME_POLICY)
    }

    const passwordPolicyIsValid = await this.isPasswordPolicyValid({ password })
    if (!passwordPolicyIsValid) {
      throw new HttpError(SIGN_UP_ERRORS.INVALID_PASSWORD_POLICY)
    }

    const exists = await this.findOne({ username })

    if (exists) {
      throw new HttpError(SIGN_UP_ERRORS.USER_ALREADY_EXISTS)
    }

    const encryptedPassword = await this.encrypt({ password })

    const user = await this.create({
      ...encryptedPassword,
      username,
      isValid: this.#config.verifyUserAuto,
    })

    const userClean: IUserClean = user

    return userClean
  }
}
