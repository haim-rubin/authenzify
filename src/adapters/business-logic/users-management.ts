import { VERIFICATION_TYPES } from '../../constant'
import { SIGN_UP_ERRORS } from '../../errors/error-codes'
import HttpError from '../../errors/HttpError'
import { USERS_SERVICE_EVENTS } from '../../events/users-service.events'
import { IUser, IUserMinimal, IVerification } from '../../interfaces/IUser'
import {
  IUsersService,
  IUsersServiceEmitter,
  IVerificationsService,
} from '../../interfaces/IUsersService'
import { ConfigService } from '../../services/config.service'
import { emitter } from '../../services/emitter'
import {
  Services,
  TSignInEmail,
  TSignUp,
  TVerificationDetails,
} from '../../types'
import { addEmailsNotificationsListeners } from '../factories/email-notifications/add-emails-notifications-listeners'

export class UsersManagement
  implements IUsersServiceEmitter, IUsersService, IVerificationsService
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
  async verifyUser(user: IUser, verification: IVerification): Promise<any> {
    const res = await this.#services.Users.verifyUser(user, verification)
    return res
  }

  createVerification(
    verificationDetails: TVerificationDetails,
  ): Promise<IVerification> {
    return this.#services.Verifications.createVerification(verificationDetails)
  }

  async getUser({ id }: { id: string }): Promise<IUserMinimal> {
    return this.#services.Users.getUser({ id })
  }

  async signUp(userDetails: TSignUp): Promise<IUserMinimal> {
    try {
      const user = await this.#services.Users.signUp(userDetails)
      emitter.emit(USERS_SERVICE_EVENTS.USER_SIGN_UP, user)
      return user
    } catch (error) {
      emitter.emit(USERS_SERVICE_EVENTS.USER_SIGN_UP_ERROR, error)
      throw error
    }
  }

  async signIn(credentials: TSignInEmail): Promise<string> {
    try {
      const token = await this.#services.Users.signIn(credentials)
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

    const user = await this.#services.Users.getUser({ id: verification.userId })

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
