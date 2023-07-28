import { ACTIVATE_USER_BY } from '../constant'
import { IConfig } from '../interfaces'

const defaultConfig = {
  activateUserBy: ACTIVATE_USER_BY.AUTO,
  storage: 'mongodb',
  uri: 'mongodb://localhost:27017/authenzify-users-management',
  saltLength: 32,
  authorizationCookieKey: 'Authorization',
  setCookieOnSignIn: true,
}

const defaultSaltLength = 32

export class ConfigService {
  #config: IConfig
  #passwordPolicyRegex: RegExp
  #usernamePolicyRegex: RegExp

  constructor(config: IConfig) {
    this.#config = { ...defaultConfig, ...config }
    this.#passwordPolicyRegex = new RegExp(config.passwordPolicy)
    this.#usernamePolicyRegex = new RegExp(config.usernamePolicy)
  }

  get activateUserAuto() {
    return this.#config.activateUserBy === ACTIVATE_USER_BY.AUTO
  }

  get activateUserByEmail() {
    return this.#config.activateUserBy === ACTIVATE_USER_BY.USER_EMAIL
  }

  get activateUserByAdmin() {
    return this.#config.activateUserBy === ACTIVATE_USER_BY.ADMIN_EMAIL
  }

  get activateUserByCode() {
    return this.#config.activateUserBy === ACTIVATE_USER_BY.CODE
  }

  get doesUsernamePolicyValid() {
    return this.#usernamePolicyRegex.test.bind(this.#usernamePolicyRegex)
  }

  get doesPasswordPolicyValid() {
    return this.#passwordPolicyRegex.test.bind(this.#passwordPolicyRegex)
  }

  get saltLength() {
    return this.#config.saltLength || defaultSaltLength
  }

  get passwordPrivateKey() {
    return this.#config.passwordPrivateKey
  }

  get privateKey() {
    return this.#config.privateKey
  }

  get publicKey() {
    return this.#config.publicKey
  }

  get storage() {
    return this.#config.storage
  }

  get uri() {
    return this.#config.uri
  }

  get jwtSignOptions() {
    return this.#config.jwtOptions
  }

  get jwtVerifyOptions() {
    return {
      ...this.#config.jwtOptions,
      algorithm: [this.#config.jwtOptions.algorithm],
    }
  }

  get authorizationCookieKey() {
    return this.#config.authorizationCookieKey
  }

  get setCookieOnSignIn() {
    return this.#config.setCookieOnSignIn
  }

  get emailProvider() {
    return this.#config.emailProvider
  }

  get clientDomain() {
    return this.#config.clientDomain
  }

  get domain() {
    return this.#config.domain
  }

  get applicationName() {
    return this.#config.applicationName
  }

  get activationVerificationRoute() {
    return this.#config.activationVerificationRoute
  }

  get usersRoutesPrefix() {
    return this.#config.usersRoutesPrefix || '/v1/users'
  }

  get host() {
    return this.#config.host || '0.0.0.0'
  }
  get port() {
    return this.#config.port || 9090
  }

  get defaultPermissionsSignUp() {
    return this.#config.onSignUpFirstBasePermissions || []
  }

  get permissionsGroups() {
    return this.#config.permissionsGroups
  }

  get permissionsVerificationRoute() {
    return this.#config.permissionsVerificationRoute
  }

  get approvePermissionsByPermissionsName() {
    return (
      this.#config.approvePermissionsByPermissionsName ||
      'allow-approve-users-permissions'
    )
  }

  get signInRoute() {
    return this.#config.signInRoute
  }

  get logger() {
    return this.#config.logger === !!this.#config.logger
      ? this.#config.logger
      : true
  }

  get resetPasswordRoute() {
    return this.#config.resetPasswordRoute
  }

  get didNotAskedToResetPasswordRoute() {
    return this.#config.didNotAskedToResetPasswordRoute
  }

  get googleSignInClientId() {
    return this.#config.googleSignInClientId
  }
}
