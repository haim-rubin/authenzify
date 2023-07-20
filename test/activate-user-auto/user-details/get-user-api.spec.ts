import * as assert from 'assert'
import { before } from 'mocha'
import { usersService } from '../../../src/app'
import { getConfig } from '../../util/settings'
import { ConfigService } from '../../../src/services/config.service'
import { factory } from '../../../src/adapters/factories'
import { IUserClean } from '../../../src/interfaces/IUser'
import { UsersManagement } from '../../../src/adapters/business-logic/users-management'
import { dropDatabase } from '../../util/mongodb-util'

describe('User', async () => {
  let server
  let user: IUserClean
  let token

  before(async () => {
    const config = await getConfig()
    const storageConfig = config.storage
    await dropDatabase(storageConfig)
    const { USER_EMAIL, USER_PASSWORD } = process.env
    const userMinimal = {
      email: USER_EMAIL,
      firstName: 'John',
      lastName: 'Doe',
    }

    const configService = new ConfigService(config)

    const usersManagement: UsersManagement = await factory(configService)
    user = await usersManagement.signUp({
      ...userMinimal,
      password: USER_PASSWORD,
    })

    token = await usersManagement.signIn({
      email: userMinimal.email,
      password: USER_PASSWORD,
    })

    server = (await usersService(config)).server
  })

  describe(`Get user by token`, () => {
    it('Should return user details when the token is valid', async () => {
      const res = await server
        .inject({
          cookies: { Authorization: token },
        })
        .get(`/v1/users/${user.id}`)

      const retUser = res.json()

      assert.equal(retUser.email, user.email)
    })
  })
})
