import * as assert from 'assert'
import * as fs from 'fs'
import { before } from 'mocha'
import * as path from 'path'
import { usersService } from '../../src/app'
import { dropDatabase } from '../util/mongodb-util'
import { ConfigService } from '../../src/services/config.service'

describe('Sign up', async () => {
  let server
  before(async () => {
    const privateKey = fs
      .readFileSync(path.join(__dirname, '../keys/authenzify-test-key'), {
        encoding: 'ascii',
      })
      .replace(/\\n/gm, '\n')
    const config = {
      verifyUserBy: 'AUTO',
      passwordPolicy: '',
      usernamePolicy: '',
      storage: 'mongodb',
      uri: 'mongodb://localhost:27017/users-management-test-api-sign-up',
      saltLength: 32,
      passwordPrivateKey: '',
      privateKey,
    }
    //await dropDatabase(config.uri)
    server = (await usersService(config)).server
  })

  describe(`Verify user by 'AUTO'`, () => {
    it('Should sign up and return verified user', async () => {
      await server
        .inject()
        .post('/users/sign-up')
        .body({
          email: 'haim3@tictuk.com',
          password: '123456',
        })
        .end((err, res) => {
          // the .end call will trigger the request
          debugger
          console.log(res.payload)
        })

      // assert.deepEqual(userClean, {
      //   email: 'haim@tictuk.com',
      //   firstName: 'Haim',
      //   lastName: 'Rubin',
      //   isValid: true,
      //   isDeleted: false,
      //   username: undefined,
      // })
    })
  })
})
