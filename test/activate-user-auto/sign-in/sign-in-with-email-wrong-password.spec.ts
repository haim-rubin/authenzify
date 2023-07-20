import * as assert from 'assert'
import { factory } from '../../../src/adapters/factories'
import { ConfigService } from '../../../src/services/config.service'
import { dropDatabase } from '../../util/mongodb-util'
import { SIGN_IN_ERRORS } from '../../../src/errors/error-codes'
import { getConfig } from '../../util/settings'
import { before } from 'mocha'

// public/private keys generated by:
// ssh-keygen -t rsa -b 1024 -m PEM -f authenzify-test-key
// ssh-keygen -f authenzify-test-key -e -m PKCS8 > authenzify-test-key.pub

describe('Sign In', () => {
  let usersManagement
  let credentials
  before(async () => {
    const config = await getConfig()
    const { USER_EMAIL, USER_PASSWORD } = process.env
    credentials = { email: USER_EMAIL, password: USER_PASSWORD }
    const storageConfig = config.storage
    await dropDatabase(storageConfig)
    const configService = new ConfigService(config)
    usersManagement = await factory(configService)
    await usersManagement.signUp({
      ...credentials,
      firstName: 'John',
      lastName: 'Doe',
    })
  })

  describe(`Verify user sign-in`, () => {
    it('Should throw error when trying sign-in with wrong password', async () => {
      try {
        await usersManagement.signIn({
          ...credentials,
          password: credentials.password + '12',
        })
      } catch (error) {
        const { httpStatusCode, code, httpStatusText } = error
        assert.deepEqual(
          {
            httpStatusCode,
            code,
            httpStatusText,
          },
          SIGN_IN_ERRORS.INVALID_USERNAME_OR_PASSWORD,
        )
      }
    })
  })
})
