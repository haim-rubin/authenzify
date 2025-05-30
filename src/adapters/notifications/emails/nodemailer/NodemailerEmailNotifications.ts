import { IUser } from '../../../../interfaces'
import { IVerification } from '../../../../interfaces/IVerificationService'
import { initNodemailer } from '../email-providers/nodemailer'
import { IEmailNotifications } from '../IEmailNotifications'

import {
  IConstantParams,
  IEmailInfo,
  IEmailTemplate,
  IEmailTemplatesRender,
} from '../util/types-interfaces'
import { INodemailerEmailSettings } from '../../../../interfaces/IConfig'

export class NodemailerEmailNotifications implements IEmailNotifications {
  #innerSendMail: (emailInfo: IEmailInfo) => Promise<any>
  #templatesRender: IEmailTemplatesRender
  #iNodemailerEmailSettings: INodemailerEmailSettings
  #constantParams: IConstantParams

  constructor(
    templates: IEmailTemplatesRender,
    iNodemailerEmailSettings: INodemailerEmailSettings,
    constantParams: IConstantParams,
  ) {
    this.#templatesRender = templates as IEmailTemplatesRender
    this.#iNodemailerEmailSettings =
      iNodemailerEmailSettings as INodemailerEmailSettings
    this.#constantParams = constantParams as IConstantParams
    this.#innerSendMail = initNodemailer(iNodemailerEmailSettings).sendMail
  }

  async sendMail(emailInfo: IEmailInfo): Promise<any> {
    try {
      const emailResponse = await this.#innerSendMail(emailInfo)
      return emailResponse
    } catch (error) {
      throw error
    }
  }

  async #prepareAndSendEmail(template: IEmailTemplate, to: string) {
    try {
      const emailInfo: IEmailInfo = {
        ...template,
        to,
      }

      const emailResponse = this.sendMail(emailInfo)
      return emailResponse
    } catch (error) {
      throw error
    }
  }

  async sendActivationMail(user: IUser, verification: IVerification) {
    try {
      const templates = this.#templatesRender.renderActivation({
        from: {
          from: this.#iNodemailerEmailSettings.from,
          applicationName: this.#constantParams.applicationName,
        },
        subject: {
          applicationName: this.#constantParams.applicationName,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        },
        html: {
          activationLink:
            this.#constantParams.activationVerificationRoute.replace(
              new RegExp(':id', 'g'),
              verification.id,
            ),
        },
      })
      return this.#prepareAndSendEmail(templates, user.email)
    } catch (error) {
      throw error
    }
  }

  sendVerificationMail(user: IUser, verification: IVerification): Promise<any> {
    try {
      const templates = this.#templatesRender.renderVerification({
        from: this.#iNodemailerEmailSettings.from,
        subject: {
          applicationName: this.#constantParams.applicationName,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        },
        html: {
          activationLink: `${this.#constantParams.domain}/verify/${
            verification.id
          }`,
        },
      })
      return this.#prepareAndSendEmail(templates, user.email)
    } catch (error) {
      throw error
    }
  }

  sendForgotPasswordMail(
    user: IUser,
    verification: IVerification,
  ): Promise<any> {
    try {
      const templates = this.#templatesRender.renderForgotPassword({
        from: this.#iNodemailerEmailSettings.from,
        subject: {
          applicationName: this.#constantParams.applicationName,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        },
        html: {
          loginUrl: `/${verification.id}`,
        },
      })
      return this.#prepareAndSendEmail(templates, user.email)
    } catch (error) {
      throw error
    }
  }

  sendPermissionsRequestMailToAdmin({
    groupsNames,
    verification,
    user,
    adminEmail,
  }) {
    const templates = this.#templatesRender.renderPermissionsRequest({
      from: {
        from: this.#iNodemailerEmailSettings.from,
        applicationName: this.#constantParams.applicationName,
      },
      subject: {
        applicationName: this.#constantParams.applicationName,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      },
      html: {
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        permissions: groupsNames.map((name) => {
          return {
            name,
            link: this.#constantParams.permissionsVerificationRoute
              .replace(new RegExp(':id', 'g'), verification.id)
              .replace(new RegExp(':role', 'g'), name),
          }
        }),
      },
    })
    return this.#prepareAndSendEmail(templates, adminEmail)
  }

  sendPermissionsApprovedMailToUser({ user, adminUser }) {
    const templates = this.#templatesRender.renderPermissionsApprovedToUser({
      from: {
        from: this.#iNodemailerEmailSettings.from,
        applicationName: this.#constantParams.applicationName,
      },
      subject: {
        applicationName: this.#constantParams.applicationName,
        email: adminUser.email,
        firstName: adminUser.firstName || '',
        lastName: adminUser.lastName || '',
      },
      html: {
        email: adminUser.email,
        firstName: adminUser.firstName || '',
        lastName: adminUser.lastName || '',
        applicationName: this.#constantParams.applicationName,
        signInRoute: this.#constantParams.signInRoute,
      },
    })
    return this.#prepareAndSendEmail(templates, user.email)
  }

  sendResetPasswordMailToUser({
    user,
    verification,
    notRequestedVerification,
  }) {
    const templates = this.#templatesRender.renderResetPasswordRequested({
      from: {
        from: this.#iNodemailerEmailSettings.from,
        applicationName: this.#constantParams.applicationName,
      },
      subject: {
        applicationName: this.#constantParams.applicationName,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      },
      html: {
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        applicationName: this.#constantParams.applicationName,
        resetPasswordRoute: this.#constantParams.resetPasswordRoute.replace(
          new RegExp(':id', 'g'),
          verification.id,
        ),
        didNotAskedToResetPasswordRoute:
          this.#constantParams.didNotAskedToResetPasswordRoute.replace(
            new RegExp(':id', 'g'),
            notRequestedVerification.id,
          ),
      },
    })
    return this.#prepareAndSendEmail(templates, user.email)
  }
}
