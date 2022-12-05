import * as assert from 'assert'
import { before, after } from 'mocha'
import { usersService } from '../../src/app'
import { dropDatabase } from '../util/mongodb-util'
import { getConfig } from '../util/settings'

describe('Sign up', async () => {
  let server
  before(async () => {
    const config = await getConfig({ port: 9192 })
    await dropDatabase(config.uri)
    server = (await usersService(config)).server
  })

  describe(`Verify user by 'AUTO'`, () => {
    it('Should test sign up api and return verified user', async () => {
      const credentials = {
        email: 'haim3@domain.com',
        password: '1@Ea5S',
      }

      const res = await server.inject().post('/users/sign-up').body(credentials)

      const { id, ...data } = res.json()

      assert.deepEqual({ email: credentials.email }, data)
    })
  })
})
