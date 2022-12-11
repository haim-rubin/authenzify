import { loadEmailTemplates } from '../../notifications/emails/EmailTemplates'
import { NodemailerEmailNotifications } from '../../notifications/emails/nodemailer/NodemailerEmailNotifications'
import { IEmailTemplatesRender } from '../../notifications/emails/util/types-interfaces'
import { EmailProvider, VERIFICATION_TYPES } from '../../../constant'
import { ConfigService } from '../../../services/config.service'
import { UsersManagement } from '../../business-logic/users-management'

export const getEmailNotificationsProvider = async (
  configService: ConfigService,
) => {
  if (configService.emailProvider) {
    switch (configService.emailProvider.provider) {
      case EmailProvider.NODEMAILER:
        const emailTemplates: IEmailTemplatesRender = await loadEmailTemplates(
          configService.emailProvider.emailTemplates,
        )

        const nodemailerProvider = new NodemailerEmailNotifications(
          emailTemplates,
          configService.emailProvider.settings,
          {
            clientDomain: configService.clientDomain,
            domain: configService.domain,
            applicationName: configService.applicationName,
            activationVerificationRoute:
              configService.activationVerificationRoute,
          },
        )

        return nodemailerProvider
    }
    return null
  }
}

export const addEmailsNotificationsListeners = async ({
  configService,
  usersManagement,
}: {
  configService: ConfigService
  usersManagement: UsersManagement
}) => {
  const emailNotifications = await getEmailNotificationsProvider(configService)
  if (
    emailNotifications &&
    (configService.activateUserByEmail || configService.activateUserByAdmin)
  ) {
    usersManagement.onSignUp(async (user) => {
      const { id } = user

      const verification = await usersManagement.createVerification({
        userId: id,
        type: VERIFICATION_TYPES.SIGN_UP,
      })

      await emailNotifications.sendActivationMail(user, verification)
    })
  }
}
