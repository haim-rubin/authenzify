import * as assert from 'assert'
import { before } from 'mocha'
import { factory } from '../../../src/adapters/factories'
import { IConfig } from '../../../src/interfaces'
import { ConfigService } from '../../../src/services/config.service'
import { dropDatabase } from '../../util/mongodb-util'
import { getConfig } from '../../util/settings'
import { ACTIVATE_USER_BY } from '../../../src/constant'
import { UsersManagement } from '../../../src/adapters/business-logic/users-management'

describe('Sign up', async () => {
  let config: IConfig
  let usersManagement: UsersManagement

  before(async () => {
    config = config = await getConfig({
      activateUserBy: ACTIVATE_USER_BY.USER_EMAIL,
    })
    await dropDatabase(config.uri)
    const configService = new ConfigService(config)

    usersManagement = await factory(configService)
  })

  describe(`Verify user by '${ACTIVATE_USER_BY.USER_EMAIL}'`, () => {
    it('Should sign up and return verified user', async () => {
      const userMinimal = {
        email: 'haim.rubin@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
      }

      const user = await usersManagement.signUp({
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
