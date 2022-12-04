import { IConfig } from '../interfaces'
const VERIFY_USER_BY = {
  AUTO: 'AUTO',
  ADMIN: 'ADMIN',
  EMAIL: 'EMAIL',
  CODE: 'CODE',
}

const defaultSaltLength = 32

export class ConfigService {
  #config
  #passwordPolicyRegex: RegExp
  #usernamePolicyRegex: RegExp

  constructor(config: IConfig) {
    this.#config = config
    this.#passwordPolicyRegex = new RegExp(config.passwordPolicy)
    this.#usernamePolicyRegex = new RegExp(config.usernamePolicy)
  }

  get verifyUserAuto() {
    return this.#config.verifyUserBy === VERIFY_USER_BY.AUTO
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
}
