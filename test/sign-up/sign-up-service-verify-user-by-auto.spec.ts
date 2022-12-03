import * as assert from 'assert'
import { before } from 'mocha'
import { factory } from '../../src/adapters/factories'
import { ConfigService } from '../../src/services/config.service'
import { dropDatabase } from '../util/mongodb-util'
import { getConfig } from '../util/settings'

describe('Sign up', async () => {
  let config
  before(async () => {
    config = await getConfig()
    await dropDatabase(config.uri)
  })

  describe(`Verify user by 'AUTO'`, () => {
    it('Should sign up and return verified user', async () => {
      const configService = new ConfigService(config)

      const services = await factory(configService)

      const user = await services.Users.signUp({
        email: 'haim@tictuk.com',
        password: '1@Ea5S',
        firstName: 'Haim',
        lastName: 'Rubin',
      })

      const { id, ...userClean } = user
      assert.deepEqual(userClean, {
        email: 'haim@tictuk.com',
        firstName: 'Haim',
        lastName: 'Rubin',
        isValid: true,
        isDeleted: false,
        username: undefined,
      })
    })
  })
})
