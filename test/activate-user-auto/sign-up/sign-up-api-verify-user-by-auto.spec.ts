import * as assert from 'assert'
import { before, after } from 'mocha'
import { usersService } from '../../../src/app'
import { dropDatabase } from '../../util/mongodb-util'
import { getConfig } from '../../util/settings'
import { ACTIVATE_USER_BY } from '../../../src/constant'
import { SIGN_UP_SUCCEEDED } from '../../../src/api/responses'

describe('Sign up', async () => {
  let server
  before(async () => {
    const config = await getConfig({ port: 9192 })
    await dropDatabase(config.uri)
    server = (await usersService(config)).server
  })

  describe(`Verify user by '${ACTIVATE_USER_BY.AUTO}'`, () => {
    it('Should test sign up api and return verified user', async () => {
      const credentials = {
        email: 'haim@tictuk.com',
        password: '1@Ea5S',
      }

      const res = await server.inject().post('/users/sign-up').body(credentials)

      const { statusCode } = res
      const msg = res.json()

      assert.deepEqual(
        { statusCode, msg },
        {
          statusCode: SIGN_UP_SUCCEEDED.httpStatusCode,
          msg: SIGN_UP_SUCCEEDED.httpResponse,
        },
      )
    })
  })
})
