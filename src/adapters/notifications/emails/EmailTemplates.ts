import { lstat, readFile } from 'fs/promises'
import { render } from 'ejs'
import {
  IEmailTemplate,
  IEmailTemplates,
  IEmailTemplatesRender,
} from './util/types-interfaces'

export const getTemplateContentOrReadFile = async (content: string) => {
  const isFile = await lstat(content)
    .then((stats) => stats.isFile())
    .catch(() => false)
  return isFile ? readFile(content, 'utf-8') : content
}

export const getTemplatesContentOrReadFile = async (
  template: IEmailTemplate,
): Promise<IEmailTemplate> => {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(template).map(async ([key, fileNameOrContent]) => {
        const template = await getTemplateContentOrReadFile(fileNameOrContent)
        return [key, template]
      }),
    ),
  )
}

export const loadEmailTemplates = async (
  templates: IEmailTemplates,
): Promise<IEmailTemplatesRender> => {
  const activation = await getTemplatesContentOrReadFile(templates.activation)

  const onVerification = await getTemplatesContentOrReadFile(
    templates.onVerification,
  )

  const forgotPassword = await getTemplatesContentOrReadFile(
    templates.forgotPassword,
  )

  const permissionsRequest = await getTemplatesContentOrReadFile(
    templates.permissionsRequest,
  )

  const permissionsApprovedToUser = await getTemplatesContentOrReadFile(
    templates.permissionsApprovedToUser,
  )

  const resetPassword = await getTemplatesContentOrReadFile(
    templates.forgotPassword,
  )

  const renderTemplate = (
    templates: IEmailTemplate,
    params: { from: any; subject: any; html: any },
  ) => {
    const from = render(templates.from, params.from)
    const subject = render(templates.subject, params.subject)
    const html = render(templates.html, params.html)
    return {
      from,
      subject,
      html,
    }
  }

  const renderActivation = (params: {
    from: any
    subject: any
    html: any
  }): IEmailTemplate => {
    return renderTemplate(activation, params)
  }

  const renderVerification = (params: {
    from: any
    subject: any
    html: any
  }) => {
    return renderTemplate(onVerification, params)
  }

  const renderForgotPassword = (params: {
    from: any
    subject: any
    html: any
  }) => {
    return renderTemplate(forgotPassword, params)
  }

  const renderPermissionsRequest = (params: {
    from: any
    subject: any
    html: any
  }): IEmailTemplate => {
    return renderTemplate(permissionsRequest, params)
  }

  const renderPermissionsApprovedToUser = (params: {
    from: any
    subject: any
    html: any
  }): IEmailTemplate => {
    return renderTemplate(permissionsApprovedToUser, params)
  }

  const renderResetPasswordRequested = (params: {
    from: any
    subject: any
    html: any
  }): IEmailTemplate => {
    return renderTemplate(resetPassword, params)
  }

  return {
    renderActivation,
    renderVerification,
    renderForgotPassword,
    renderPermissionsRequest,
    renderPermissionsApprovedToUser,
    renderResetPasswordRequested,
  }
}
