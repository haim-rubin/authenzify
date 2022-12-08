import * as assert from 'assert'
import { before, after } from 'mocha'
import { factory } from '../../../src/adapters/factories'
import { usersService } from '../../../src/app'
import { IConfig } from '../../../src/interfaces'
import { ConfigService } from '../../../src/services/config.service'
import { dropDatabase } from '../../util/mongodb-util'
import { getConfig } from '../../util/settings'
import { ACTIVATE_USER_BY } from '../../../src/constant'

describe('Sign up', async () => {
  let server
  let config: IConfig
  const credentials = {
    email: 'haim4@domain.com',
    password: '1@Ea5S',
  }
  before(async () => {
    config = await getConfig({
      activateUserBy: ACTIVATE_USER_BY.USER_EMAIL,
      port: 9293,
    })
    await dropDatabase(config.uri)
    const configService = new ConfigService(config)
    const users = await factory(configService)
    await users.Users.signUp(credentials)
    server = (await usersService(config)).server
  })

  describe(`Verify user by '${ACTIVATE_USER_BY.USER_EMAIL}'`, () => {
    it('Should test sign up for verify authorization token', async () => {
      const res = await server.inject().post('/users/sign-in').body(credentials)

      const { token } = res.json()
      const cookie = res.cookies.find(({ name }) => {
        return name === config.authorizationCookieKey
      })
      assert.equal(cookie?.value, token)
    })
  })
})
