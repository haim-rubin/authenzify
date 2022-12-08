import * as assert from 'assert'
import { before } from 'mocha'
import { usersService } from '../../../src/app'
import { getConfig } from '../../util/settings'
import { ConfigService } from '../../../src/services/config.service'
import { factory } from '../../../src/adapters/factories'
import { Services } from '../../../src/types'
import { IUserMinimal } from '../../../src/interfaces/IUser'
import { ACTIVATE_USER_BY } from '../../../src/constant'

describe('User', async () => {
  let server
  let services: Services
  let user: IUserMinimal
  let token

  before(async () => {
    const config = await getConfig({
      activateUserBy: ACTIVATE_USER_BY.USER_EMAIL,
      port: 9393,
    })
    const userMinimal = {
      email: 'haim6@domain.com',
      firstName: 'John',
      lastName: 'Doe',
    }

    const configService = new ConfigService(config)

    const services = await factory(configService)
    user = await services.Users.signUp({
      ...userMinimal,
      password: '1@Ea5S',
    })

    token = await services.Users.signIn({
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
