export interface IConfig {
  verifyUserBy: string
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
}
