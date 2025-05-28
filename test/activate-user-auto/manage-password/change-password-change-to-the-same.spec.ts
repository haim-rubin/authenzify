import * as assert from 'assert'
import { before, after } from 'mocha'
import { factory } from '../../../src/adapters/factories'
import { usersService } from '../../../src/app'
import { IConfig } from '../../../src/interfaces'
import { ConfigService } from '../../../src/services/config.service'
import { dropDatabase } from '../../util/mongodb-util'
import { getConfig } from '../../util/settings'
import { ACTIVATE_USER_BY } from '../../../src/constant'

describe('Change Password', async () => {
  let server
  let config: IConfig
  let credentials
  let token
  before(async () => {
    config = await getConfig({ port: 9296 })
    const { USER_EMAIL, USER_PASSWORD } = process.env
    credentials = { email: USER_EMAIL, password: USER_PASSWORD }
    const storageConfig = config.storage
    await dropDatabase(storageConfig)
    const configService = new ConfigService(config)
    const usersManagement = await factory(configService)
    await usersManagement.signUp(credentials)
    server = (await usersService(config)).server
    const res = await server
      .inject()
      .post('/v1/users/sign-in')
      .body(credentials)
    const tokenRes = res.json()
    token = tokenRes.token
  })

  describe(`Verify change password to the same password`, () => {
    it('Should throw an exception the same password already used', async () => {
      const user = await server.inject({
        method: 'post',
        url: '/v1/users/change-password',

        payload: {
          password: credentials.password,
          newPassword: credentials.password,
        },

        cookies: { [config.authorizationCookieKey]: token },
      })

      assert.equal(
        user.json().code,
        'CHANGE_PASSWORD.CANNOT_CHANGE_TO_THE_EXISTING_PASSWORD',
      )
    })
  })
})
