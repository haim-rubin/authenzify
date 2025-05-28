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
    config = await getConfig()
    const storageConfig = config.storage
    await dropDatabase(storageConfig)
    const configService = new ConfigService(config)

    usersManagement = await factory(configService)
  })

  describe(`Verify user by '${ACTIVATE_USER_BY.AUTO}'`, () => {
    it('Should sign up and return verified user', async () => {
      const { USER_EMAIL, USER_PASSWORD } = process.env
      const userMinimal = {
        email: USER_EMAIL,
        firstName: 'John',
        lastName: 'Doe',
      }

      const user = await usersManagement.signUp({
        ...userMinimal,
        password: USER_PASSWORD,
      })

      const { id, permissions, permissionsGroups, ...userClean } = user
      assert.deepEqual(userClean, {
        email: USER_EMAIL,
        firstName: 'John',
        lastName: 'Doe',
        username: undefined,
        isDeleted: false,
        isValid: true,
      })
    })
  })
})
