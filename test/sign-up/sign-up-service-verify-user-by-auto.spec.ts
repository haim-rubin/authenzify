import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import { factory } from '../../src/adapters/factories'
import { IUserClean } from '../../src/interfaces/IUser'
import { ConfigService } from '../../src/services/config.service'
import { dropDatabase } from '../util/mongodb-util'
describe('Sign up', async () => {
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
    uri: 'mongodb://localhost:27017/users-management-test',
    saltLength: 32,
    passwordPrivateKey: '',
    privateKey,
  }
  describe(`Verify user by 'AUTO'`, () => {
    it('Should sign up and return verified user', async () => {
      await dropDatabase(config.uri)
      const configService = new ConfigService(config)

      const services = await factory(configService)

      const user = await services.Users.signUp({
        email: 'haim@tictuk.com',
        password: '123456',
        firstName: 'Haim',
        lastName: 'Rubin',
      })

      const { id, ...userClean } = user
      assert.deepEqual(userClean, {
        email: 'haim@tictuk.com',
        firstName: 'Haim',
        lastName: 'Rubin',
        isValid: true,
        isDeleted: false,
        username: undefined,
      })
    })
  })
})
