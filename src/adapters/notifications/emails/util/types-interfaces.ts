export interface IEmailTemplate {
  from: string
  subject: string
  html: string
}

export interface IEmailTemplates {
  activation: IEmailTemplate
  onVerification: IEmailTemplate
  forgotPassword: IEmailTemplate
  permissionsRequest: IEmailTemplate
}

export interface IEmailTemplatesRender {
  renderActivation(params: {
    from: any
    subject: any
    html: any
  }): IEmailTemplate
  renderVerification(params: {
    from: any
    subject: any
    html: any
  }): IEmailTemplate
  renderForgotPassword(params: {
    from: any
    subject: any
    html: any
  }): IEmailTemplate
  renderPermissionsRequest(params: {
    from: any
    subject: any
    html: any
  }): IEmailTemplate
}

export interface IConstantParams {
  domain: string
  applicationName: string
  clientDomain: string
  activationVerificationRoute: string
  permissionsVerificationRoute: string
}

export interface IEmailInfo extends IEmailTemplate {
  to: string
}
