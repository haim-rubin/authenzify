import * as assert from 'assert'
import { before } from 'mocha'
import { usersService } from '../../src/app'
import { decode } from 'jsonwebtoken'
import { getConfig } from '../util/settings'

describe('User', async () => {
  let server
  before(async () => {
    const config = await getConfig()
    server = (await usersService(config)).server
  })

  describe(`Get user by token`, () => {
    it('Should return user details when the token is valid', async () => {
      const email = 'haim3@tictuk.com'

      await server
        .inject()
        .post('/users/sign-in')
        .body({
          email,
          password: '1@Ea5S',
        })
        .end(async (err, res) => {
          const decoded = decode(res.payload)
          assert.equal(email, decoded.email)
        })
    })
  })
})
