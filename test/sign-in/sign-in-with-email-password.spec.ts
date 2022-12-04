import { decode } from 'jsonwebtoken'
import * as assert from 'assert'
import { factory } from '../../src/adapters/factories'
import { ConfigService } from '../../src/services/config.service'
import { dropDatabase } from '../util/mongodb-util'
import { getConfig } from '../util/settings'
import { before } from 'mocha'

// public/private keys generated by:
// ssh-keygen -t rsa -b 1024 -m PEM -f authenzify-test-key
// ssh-keygen -f authenzify-test-key -e -m PKCS8 > authenzify-test-key.pub

describe('Sign In', () => {
  let services
  before(async () => {
    const config = await getConfig()
    await dropDatabase(config.uri)
    const configService = new ConfigService(config)

    services = await factory(configService)
  })

  describe(`Verify user by 'AUTO'`, () => {
    it('Should test Users.signIn decode JWT token is valid', async () => {
      const credentials = { email: 'haim@tictuk.com', password: '1@Ea5S' }

      await services.Users.signUp({
        ...credentials,
        firstName: 'John',
        lastName: 'Doe',
      })

      const token = await services.Users.signIn(credentials)
      const decoded = decode(token)
      assert.equal(decoded.email, credentials.email)
    })
  })
})
