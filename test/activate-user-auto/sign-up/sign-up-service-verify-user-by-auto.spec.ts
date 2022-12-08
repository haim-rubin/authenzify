import * as assert from 'assert'
import { before } from 'mocha'
import { factory } from '../../../src/adapters/factories'
import { IConfig } from '../../../src/interfaces'
import { ConfigService } from '../../../src/services/config.service'
import { Services } from '../../../src/types'
import { dropDatabase } from '../../util/mongodb-util'
import { getConfig } from '../../util/settings'
import { ACTIVATE_USER_BY } from '../../../src/constant'

describe('Sign up', async () => {
  let config: IConfig
  let services: Services

  before(async () => {
    config = await getConfig()
    await dropDatabase(config.uri)
    const configService = new ConfigService(config)

    services = await factory(configService)
  })

  describe(`Verify user by '${ACTIVATE_USER_BY.AUTO}'`, () => {
    it('Should sign up and return verified user', async () => {
      const userMinimal = {
        email: 'haim.rubin@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
      }

      const user = await services.Users.signUp({
        ...userMinimal,
        password: '1@Ea5S',
      })

      const { id, ...userClean } = user
      assert.deepEqual(userClean, {
        email: 'haim.rubin@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        username: undefined,
      })
    })
  })
})
