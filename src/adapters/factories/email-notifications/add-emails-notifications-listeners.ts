import { loadEmailTemplates } from '../../notifications/emails/EmailTemplates'
import { NodemailerEmailNotifications } from '../../notifications/emails/nodemailer/NodemailerEmailNotifications'
import { IEmailTemplatesRender } from '../../notifications/emails/util/types-interfaces'
import { EmailProvider } from '../../../constant'
import { ConfigService } from '../../../services/config.service'

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
          },
        )

        return nodemailerProvider
    }
    return null
  }
}
