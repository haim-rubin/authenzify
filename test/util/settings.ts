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

  const config: IConfig = {
    verifyUserBy: 'AUTO',
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
  }
  return config
}
