import * as assert from 'assert'
import { before, after } from 'mocha'
import { factory } from '../../src/adapters/factories'
import { usersService } from '../../src/app'
import { IConfig } from '../../src/interfaces'
import { ConfigService } from '../../src/services/config.service'
import { dropDatabase } from '../util/mongodb-util'
import { getConfig } from '../util/settings'

describe('Sign up', async () => {
  let server
  let config: IConfig
  const credentials = {
    email: 'haim4@domain.com',
    password: '1@Ea5S',
  }
  before(async () => {
    config = await getConfig({ port: 9191 })
    await dropDatabase(config.uri)
    const configService = new ConfigService(config)
    const users = await factory(configService)
    await users.Users.signUp(credentials)
    server = (await usersService(config)).server
  })

  describe(`Verify user by 'AUTO'`, () => {
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
