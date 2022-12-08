import { IEmailTemplates } from '../adapters/notifications/emails/util/types-interfaces'

export interface INodemailerEmailSettings {
  from: string
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export type IEmailSettings = INodemailerEmailSettings

export interface IConfig {
  domain: string
  clientDomain: string
  appUrl: string
  onActivationUrl: string
  onForgotPasswordUrl: string
  adminEmail: string
  applicationName: string
  activateUserBy: string
  passwordPolicy: string
  usernamePolicy: string
  storage: string
  uri: string
  saltLength: number
  passwordPrivateKey: string
  privateKey: string
  publicKey: string
  jwtOptions: {
    issuer: string
    subject: string
    audience: string
    expiresIn: string
    algorithm: string
  }
  host: string
  port: number
  authorizationCookieKey: string
  setCookieOnSignIn: boolean
  emailProvider: {
    provider: string
    settings: IEmailSettings
    emailTemplates: IEmailTemplates
  }
}
