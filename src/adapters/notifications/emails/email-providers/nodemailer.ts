import * as nodemailer from 'nodemailer'

export const initNodemailer = ({ port, secure = false, auth }) => {
  const { user, pass } = auth
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })

  return {
    sendMail: transporter.sendMail.bind(transporter),
  }
}
