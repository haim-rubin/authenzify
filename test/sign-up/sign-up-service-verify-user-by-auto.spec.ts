import * as assert from 'assert'
import { before } from 'mocha'
import { factory } from '../../src/adapters/factories'
import { IConfig } from '../../src/interfaces'
import { ConfigService } from '../../src/services/config.service'
import { ServicesEvents } from '../../src/types'
import { dropDatabase } from '../util/mongodb-util'
import { getConfig } from '../util/settings'

describe('Sign up', async () => {
  let config: IConfig
  let services: ServicesEvents

  before(async () => {
    config = await getConfig()
    await dropDatabase(config.uri)
    const configService = new ConfigService(config)

    services = await factory(configService)
  })

  describe(`Verify user by 'AUTO'`, () => {
    it('Should sign up and return verified user', async () => {
      const userMinimal = {
        email: 'haim@domain.com',
        firstName: 'John',
        lastName: 'Doe',
      }

      const user = await services.Users.signUp({
        ...userMinimal,
        password: '1@Ea5S',
      })

      const { id, ...userClean } = user
      assert.deepEqual(userClean, {
        email: 'haim@domain.com',
        firstName: 'John',
        lastName: 'Doe',
        username: undefined,
      })
    })
  })
})
