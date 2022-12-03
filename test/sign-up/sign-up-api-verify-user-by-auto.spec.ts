import * as assert from 'assert'
import { before } from 'mocha'
import { usersService } from '../../src/app'
import { dropDatabase } from '../util/mongodb-util'
import { getConfig } from '../util/settings'

describe('Sign up', async () => {
  let server
  before(async () => {
    const config = await getConfig({ port: 9191 })
    await dropDatabase(config.uri)
    server = (await usersService(config)).server
  })

  describe(`Verify user by 'AUTO'`, () => {
    it('Should test sign up api and return verified user', async () => {
      const credentials = {
        email: 'haim3@tictuk.com',
        password: '1@Ea5S',
      }

      await server
        .inject()
        .post('/users/sign-up')
        .body(credentials)
        .end((err, res) => {
          // the .end call will trigger the request
          const { id, ...data } = res.json()
          assert.deepEqual(
            {
              email: credentials.email,
              isDeleted: false,
              isValid: true,
            },
            data,
          )
        })
    })
  })
})
