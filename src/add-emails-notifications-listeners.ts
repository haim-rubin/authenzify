import { loadEmailTemplates } from './adapters/notifications/emails/EmailTemplates'
import { NodemailerEmailNotifications } from './adapters/notifications/emails/nodemailer/NodemailerEmailNotifications'
import { IEmailTemplatesRender } from './adapters/notifications/emails/util/types-interfaces'
import { ACTIVATE_USER_BY, EmailProvider, VerificationTypes } from './constant'
import { IConfig } from './interfaces'
import { ConfigService } from './services/config.service'
import { Services } from './types'

const getEmailNotificationsProvider = async (config: IConfig) => {
  if (config.emailProvider) {
    switch (config.emailProvider.provider) {
      case EmailProvider.NODEMAILER:
        const emailTemplates: IEmailTemplatesRender = await loadEmailTemplates(
          config.emailProvider.emailTemplates,
        )

        const nodemailerProvider = new NodemailerEmailNotifications(
          emailTemplates,
          config.emailProvider.settings,
          {
            clientDomain: config.clientDomain,
            domain: config.domain,
            applicationName: config.applicationName,
          },
        )

        return nodemailerProvider
    }
    return null
  }
}

export const addEmailsNotificationsListeners = async (
  config: IConfig,
  configService: ConfigService,
  services: Services,
) => {
  const emailNotifications = await getEmailNotificationsProvider(config)
  if (
    emailNotifications &&
    (configService.activateUserByEmail || configService.activateUserByAdmin)
  ) {
    services.events.Users.onSignUp(async (user) => {
      const { id } = user

      const verification = await services.Verifications.create({
        userId: id,
        type: VerificationTypes.SIGN_UP,
      })

      await emailNotifications.sendActivationMail(user, verification)
    })
  }
}
