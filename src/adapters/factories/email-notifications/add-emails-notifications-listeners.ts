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
            permissionsVerificationRoute:
              configService.permissionsVerificationRoute,
            signInRoute: configService.signInRoute,
            resetPasswordRoute: configService.resetPasswordRoute,
            didNotAskedToResetPasswordRoute:
              configService.didNotAskedToResetPasswordRoute,
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
  if (emailNotifications) {
    if (
      configService.activateUserByEmail ||
      configService.activateUserByAdmin
    ) {
      usersManagement.onSignUp(async (user) => {
        try {
          const { id } = user

          const verification = await usersManagement.createVerification({
            userId: id,
            type: VERIFICATION_TYPES.SIGN_UP,
          })

          await emailNotifications.sendActivationMail(user, verification)
        } catch (error) {
          console.error('Failed to send sign up request email')
          console.error(error)
        }
      })
    }
    usersManagement.onPermissionsRequested(
      async ({ permissionsGroups, verification, user, adminEmail }) => {
        try {
          const groupsNames = permissionsGroups.map(({ name }) => name)

          await emailNotifications.sendPermissionsRequestMailToAdmin({
            groupsNames,
            verification,
            user,
            adminEmail,
          })
        } catch (error) {
          console.error('Failed to send permissions request email')
          console.error(error)
        }
      },
    )

    usersManagement.onPermissionsApproved(async ({ user, adminUser }) => {
      try {
        await emailNotifications.sendPermissionsApprovedMailToUser({
          user,
          adminUser,
        })
      } catch (error) {
        console.error('Failed to send permissions request email')
        console.error(error)
      }
    })

    usersManagement.onForgotPassword(
      async ({ user, verification, notRequestedVerification }) => {
        try {
          await emailNotifications.sendResetPasswordMailToUser({
            user,
            verification,
            notRequestedVerification,
          })
        } catch (error) {
          console.error('Failed to send reset password request email')
          console.error(error)
        }
      },
    )
  }
}
