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
  let credentials
  before(async () => {
    config = await getConfig({ port: 9191 })
    const { USER_EMAIL, USER_PASSWORD } = process.env
    credentials = { email: USER_EMAIL, password: USER_PASSWORD }
    const storageConfig = config.storage
    await dropDatabase(storageConfig)
    const configService = new ConfigService(config)
    const usersManagement = await factory(configService)
    await usersManagement.signUp(credentials)
    server = (await usersService(config)).server
  })

  describe(`Verify user by '${ACTIVATE_USER_BY.AUTO}'`, () => {
    it('Should test sign up for verify authorization token', async () => {
      const res = await server.inject().post('/users/sign-in').body(credentials)

      const { token } = res.json()
      const cookie = res.cookies.find(({ name, value }) => {
        return name === config.authorizationCookieKey && value
      })
      assert.equal(cookie?.value, token)
    })
  })
})
