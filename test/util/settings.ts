import * as fs from 'fs'
import * as path from 'path'
import { IConfig } from '../../src/interfaces'
import { ACTIVATE_USER_BY } from '../../src/constant'

const cleanQuotes = (value) => {
  const [start, ...excludeStart] = `${value}`
  if (start !== '"') {
    return value
  }
  const [end, ...excludeStartEnd] = excludeStart.reverse()
  return excludeStartEnd.reverse().join('')
}

const parseEnv = (env) => {
  return env
    .split('\n')
    .map((keyValueString) => keyValueString.split('='))
    .reduce(
      (config, [key, value]) => ({ ...config, [key]: cleanQuotes(value) }),
      {},
    )
}

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

  const env = fs.readFileSync(path.join(__dirname, '../../.env'), {
    encoding: 'ascii',
  })
  const envParsed = parseEnv(env)
  Object.entries(envParsed).forEach(([key, value]: [string, any]) => {
    process.env[key] = process.env[key] || value
  })

  const templatesBasePath = path.join(__dirname, './templates/email')

  const { GMAIL_PASSWORD, GMAIL_USER } = envParsed

  const config: IConfig = {
    clientDomain: 'http://localhost:9090',
    applicationName: 'Authenzify',
    activationVerificationRoute:
      'http://localhost:9090/users/verify/:id/activation',
    domain: 'http://localhost:9090',
    activateUserBy: ACTIVATE_USER_BY.AUTO,
    passwordPolicy: '^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$',
    usernamePolicy: '',
    storage: {
      type: 'mongodb',
      uri: `mongodb://localhost:27017/users-management-test-api-sign-up`,
      options: {
        dbName: 'users-management',
      },
    },
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
