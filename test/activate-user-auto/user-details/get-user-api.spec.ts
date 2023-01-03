import * as assert from 'assert'
import { before } from 'mocha'
import { usersService } from '../../../src/app'
import { getConfig } from '../../util/settings'
import { ConfigService } from '../../../src/services/config.service'
import { factory } from '../../../src/adapters/factories'
import { IUserClean } from '../../../src/interfaces/IUser'
import { UsersManagement } from '../../../src/adapters/business-logic/users-management'

describe('User', async () => {
  let server
  let user: IUserClean
  let token

  before(async () => {
    const config = await getConfig()
    const userMinimal = {
      email: 'haim6@domain.com',
      firstName: 'John',
      lastName: 'Doe',
    }

    const configService = new ConfigService(config)

    const usersManagement: UsersManagement = await factory(configService)
    user = await usersManagement.signUp({
      ...userMinimal,
      password: '1@Ea5S',
    })

    token = await usersManagement.signIn({
      email: userMinimal.email,
      password: '1@Ea5S',
    })

    server = (await usersService(config)).server
  })

  describe(`Get user by token`, () => {
    it('Should return user details when the token is valid', async () => {
      const res = await server
        .inject({
          cookies: { Authorization: token },
        })
        .get(`/users/${user.id}`)

      const retUser = res.json()

      assert.equal(retUser.email, user.email)
    })
  })
})
