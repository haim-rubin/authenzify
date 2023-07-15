import * as assert from 'assert'
import { before } from 'mocha'
import { usersService } from '../../../src/app'
import { dropDatabase } from '../../util/mongodb-util'
import { getConfig } from '../../util/settings'
import { ACTIVATE_USER_BY } from '../../../src/constant'

describe('Sign up', async () => {
  let server
  let config
  const { USER_EMAIL, USER_PASSWORD } = process.env
  const credentials = { email: USER_EMAIL, password: USER_PASSWORD }
  let token
  before(async () => {
    config = await getConfig({ port: 9393 })
    const storageConfig = config.storage
    await dropDatabase(storageConfig)
    server = (await usersService(config)).server
    await server.inject().post('/users/sign-up').body(credentials)
    const res = await server.inject().post('/users/sign-in').body(credentials)
    const tokenRes = res.json()
    token = tokenRes.token
  })

  describe(`Verify user by '${ACTIVATE_USER_BY.AUTO}'`, () => {
    it('Should test sign up api and return verified user', async () => {
      const user = await server.inject({
        method: 'GET',
        url: '/users/me',

        payload: credentials,

        cookies: { [config.authorizationCookieKey]: token },
      })
      const { email } = user.json()
      assert.equal(email, credentials.email)
    })
  })
})
