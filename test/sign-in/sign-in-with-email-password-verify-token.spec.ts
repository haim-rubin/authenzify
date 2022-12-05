import { decode } from 'jsonwebtoken'
import * as assert from 'assert'
import { factory } from '../../src/adapters/factories'
import { ConfigService } from '../../src/services/config.service'
import { dropDatabase } from '../util/mongodb-util'
import { getConfig } from '../util/settings'
import { before } from 'mocha'
import { initVerifyToken } from '../../src'
import { IConfig } from '../../src/interfaces'
import { ServicesEvents } from '../../src/types'

// public/private keys generated by:
// ssh-keygen -t rsa -b 1024 -m PEM -f authenzify-test-key
// ssh-keygen -f authenzify-test-key -e -m PKCS8 > authenzify-test-key.pub

describe('Sign In', () => {
  let services: ServicesEvents
  let config: IConfig
  const credentials = { email: 'haim@domain.com', password: '1@Ea5S' }

  before(async () => {
    config = await getConfig()
    await dropDatabase(config.uri)
    const configService = new ConfigService(config)

    services = await factory(configService)
    await services.Users.signUp({
      ...credentials,
      firstName: 'John',
      lastName: 'Doe',
    })
  })

  describe(`Verify user by 'AUTO'`, () => {
    it('Should test Users.signIn verify token', async () => {
      const token = await services.Users.signIn(credentials)
      const { verifyToken } = initVerifyToken({
        publicKey: config.publicKey,
        jwtOptions: config.jwtOptions,
      })
      const encoded = verifyToken(token)
      assert.equal(encoded.email, credentials.email)
    })
  })
})
