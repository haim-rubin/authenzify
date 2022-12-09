import { sign, verify } from 'jsonwebtoken'
import { SIGN_UP_ERRORS, SIGN_IN_ERRORS } from '../errors/error-codes'
import HttpError from '../errors/HttpError'
import {
  IUser,
  IUserClean,
  IUserMinimal,
  IVerification,
} from '../interfaces/IUser'
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

import {
  IUserServiceEncryption,
  IUserServiceValidation,
} from '../interfaces/IUsersService'

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
export class UsersService
  implements IUsersService, IUserServiceEncryption, IUserServiceValidation
{
  #config: ConfigService
  #iDalUsersService: IDalUsersService

  constructor(config: ConfigService, iDalUsersService: IDalUsersService) {
    this.#config = config
    this.#iDalUsersService = iDalUsersService
  }
  verifyUser(user: IUser, verification: IVerification): Promise<any> {
    return this.#iDalUsersService.verifyUser(user, verification)
  }

  doesUsernamePolicyValid({ email }: { email: string }): Promise<Boolean> {
    return Promise.resolve(this.#config.doesUsernamePolicyValid(email))
  }

  doesPasswordPolicyValid({
    password,
  }: {
    password: string
  }): Promise<boolean> {
    return Promise.resolve(this.#config.doesPasswordPolicyValid(password))
  }

  verifyToken(token): any {
    const decoded = verify(
      token,
      this.#config.publicKey,
      this.#config.jwtVerifyOptions,
    )
    return decoded
  }

  async signIn(credentials: TSignInEmail): Promise<string> {
    const user = await this.findOne({ email: credentials.email })

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
      passwordPrivateKey: this.#config.passwordPrivateKey,
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
      this.#config.privateKey,
      this.#config.jwtSignOptions,
    )

    return token
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

  async signUp(userDetails: TSignUp): Promise<IUserMinimal> {
    try {
      const { email, password } = userDetails
      const usernamePolicyIsValid = await this.#config.doesUsernamePolicyValid(
        email,
      )
      if (!usernamePolicyIsValid) {
        throw new HttpError(SIGN_UP_ERRORS.INVALID_USERNAME_POLICY)
      }

      const passwordPolicyIsValid = await this.#config.doesPasswordPolicyValid(
        password,
      )

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
        isValid: this.#config.activateUserAuto,
      })

      const userClean: IUserMinimal = mapToMinimal(user)

      return userClean
    } catch (error) {
      throw error
    }
  }

  async getUser({ id }: { id: string }): Promise<IUserClean> {
    const user = await this.#iDalUsersService.findById({ id })
    return mapToMinimal({ ...user })
  }
}
