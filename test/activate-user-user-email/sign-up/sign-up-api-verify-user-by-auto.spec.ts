import * as assert from 'assert'
import { before } from 'mocha'
import { usersService } from '../../../src/app'
import { dropDatabase } from '../../util/mongodb-util'
import { getConfig } from '../../util/settings'
import { ACTIVATE_USER_BY } from '../../../src/constant'

describe('Sign up', async () => {
  let server
  before(async () => {
    const config = await getConfig({
      activateUserBy: ACTIVATE_USER_BY.USER_EMAIL,
      port: 9292,
    })
    await dropDatabase(config.uri)
    server = (await usersService(config)).server
  })

  describe(`Verify user by '${ACTIVATE_USER_BY.USER_EMAIL}'`, () => {
    it('Should test sign up api and return verified user', async () => {
      const credentials = {
        email: 'haim@tictuk.com',
        password: '1@Ea5S',
      }

      const res = await server.inject().post('/users/sign-up').body(credentials)

      const { id, ...data } = res.json()

      assert.deepEqual({ email: credentials.email }, data)
    })
  })
})
