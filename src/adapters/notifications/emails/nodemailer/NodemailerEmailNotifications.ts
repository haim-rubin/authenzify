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
    this.#templatesRender = templates
    this.#iNodemailerEmailSettings = iNodemailerEmailSettings
    this.#constantParams = constantParams
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
}
