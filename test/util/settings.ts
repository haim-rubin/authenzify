import * as fs from 'fs'
import * as path from 'path'
import { IConfig } from '../../src/interfaces'

export const getConfig = async (configOption?: any) => {
  const privateKey = fs.readFileSync(
    path.join(__dirname, '../keys/authenzify-test-key'),
    {
      encoding: 'ascii',
    },
  )

  const publicKey = fs.readFileSync(
    path.join(__dirname, '../keys/authenzify-test-key.pub'),
    {
      encoding: 'ascii',
    },
  )

  const templatesBasePath = path.join(__dirname, './email-templates')

  const { GMAIL_PASSWORD, GMAIL_USER } = process.env

  const config: IConfig = {
    clientDomain: 'http://localhost:9090',
    applicationName: 'Authenzify',
    domain: 'http://localhost:9090',
    activateUserBy: 'AUTO',
    passwordPolicy: '^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$',
    usernamePolicy: '',
    storage: 'mongodb',
    uri: 'mongodb://localhost:27017/users-management-test-api-sign-up',
    saltLength: 32,
    passwordPrivateKey: '' || 'your-private-key',
    privateKey,
    publicKey,
    jwtOptions: {
      issuer: 'Authenzify corp',
      subject: 'admin@authenzify.com',
      audience: 'http://authenzify.com',
      expiresIn: '12h',
      algorithm: 'RS256',
    },
    authorizationCookieKey: 'Authorization',
    ...configOption,
    setCookieOnSignIn: true,
    emailProvider: {
      provider: 'nodemailer',
      settings: {
        from: 'haim@tictuk.com',
        host: 'gmail',
        port: 587,
        secure: false,
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_PASSWORD,
        },
      },
      emailTemplates: {
        activation: {
          from: path.join(templatesBasePath, '/activation', '/from.ejs'),
          html: path.join(templatesBasePath, '/activation', '/body.html'),
          subject: path.join(templatesBasePath, '/activation', '/subject.ejs'),
        },
        forgotPassword: {
          from: path.join(templatesBasePath, '/forgot-password', '/from.ejs'),
          html: path.join(templatesBasePath, '/forgot-password', '/body.html'),
          subject: path.join(
            templatesBasePath,
            '/forgot-password',
            '/subject.ejs',
          ),
        },
        onVerification: {
          from: path.join(templatesBasePath, '/on-verification', '/from.ejs'),
          html: path.join(templatesBasePath, '/on-verification', '/body.html'),
          subject: path.join(
            templatesBasePath,
            '/on-verification',
            '/subject.ejs',
          ),
        },
      },
    },
  }
  return config
}
