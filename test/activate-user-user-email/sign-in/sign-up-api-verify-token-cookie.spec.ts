import * as assert from 'assert'
import { before } from 'mocha'
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
    config = await getConfig({
      activateUserBy: ACTIVATE_USER_BY.USER_EMAIL,
      port: 9293,
    })
    const { USER_EMAIL, USER_PASSWORD } = process.env
    credentials = { email: USER_EMAIL, password: USER_PASSWORD }
    const storageConfig = config.storage
    await dropDatabase(storageConfig)
    const configService = new ConfigService(config)
    const usersManagement = await factory(configService)
    await usersManagement.signUp(credentials)
    server = (await usersService(config)).server
  })

  describe(`Verify user by '${ACTIVATE_USER_BY.USER_EMAIL}'`, () => {
    it('Should test sign up for verify authorization token', async () => {
      const res = await server
        .inject()
        .post('/v1/users/sign-in')
        .body(credentials)

      const { token } = res.json()
      const cookie = res.cookies.find(({ name }) => {
        return name === config.authorizationCookieKey
      })
      assert.equal(cookie?.value, token)
    })
  })
})
