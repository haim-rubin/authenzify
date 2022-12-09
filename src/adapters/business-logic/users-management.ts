import { VERIFICATION_TYPES } from '../../constant'
import { SIGN_UP_ERRORS } from '../../errors/error-codes'
import HttpError from '../../errors/HttpError'
import { USERS_SERVICE_EVENTS } from '../../events/users-service.events'
import { IUserMinimal, IVerification } from '../../interfaces/IUser'
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
import { getEmailNotificationsProvider } from './add-emails-notifications-listeners'

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
  //#region email-notifications
  #addEmailsNotificationsListeners = async () => {
    const emailNotifications = await getEmailNotificationsProvider(
      this.#configService,
    )
    if (
      emailNotifications &&
      (this.#configService.activateUserByEmail ||
        this.#configService.activateUserByAdmin)
    ) {
      this.onSignUp(async (user) => {
        const { id } = user

        const verification = await this.createVerification({
          userId: id,
          type: VERIFICATION_TYPES.SIGN_UP,
        })

        await emailNotifications.sendActivationMail(user, verification)
      })
    }
  }
  //#endregion email-notifications
  async init() {
    await this.#addEmailsNotificationsListeners()
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
      id: verificationId,
      type: VERIFICATION_TYPES.SIGN_UP,
      isDeleted: false,
    })

    if (!verification) {
      throw new HttpError(SIGN_UP_ERRORS.INVALID_ACTION)
    }

    const user = await this.#services.Users.getUser({ id: verification.userId })

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

  await usersManagement.init()
  return usersManagement
}
