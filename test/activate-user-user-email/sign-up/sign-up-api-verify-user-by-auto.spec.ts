import * as assert from 'assert'
import { before } from 'mocha'
import { usersService } from '../../../src/app'
import { dropDatabase } from '../../util/mongodb-util'
import { getConfig } from '../../util/settings'
import { ACTIVATE_USER_BY } from '../../../src/constant'
import { SIGN_UP_SUCCEEDED } from '../../../src/api/responses'

describe('Sign up', async () => {
  let server
  before(async () => {
    const config = await getConfig({
      activateUserBy: ACTIVATE_USER_BY.USER_EMAIL,
      port: 9292,
    })
    const storageConfig = config.storage
    await dropDatabase(storageConfig)
    server = (await usersService(config)).server
  })

  describe(`Verify user by '${ACTIVATE_USER_BY.USER_EMAIL}'`, () => {
    it('Should test sign up api and return verified user', async () => {
      const { USER_EMAIL, USER_PASSWORD } = process.env
      const credentials = { email: USER_EMAIL, password: USER_PASSWORD }

      const res = await server
        .inject()
        .post('/v1/users/sign-up')
        .body(credentials)
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
