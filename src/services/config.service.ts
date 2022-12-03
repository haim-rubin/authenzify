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

  constructor(config: IConfig) {
    this.#config = config
  }

  get verifyUserAuto() {
    return this.#config.verifyUserBy === VERIFY_USER_BY.AUTO
  }

  get passwordPolicy() {
    return this.#config.passwordPolicy
  }

  get usernamePolicy() {
    return this.#config.usernamePolicy
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
