import * as assert from 'assert'
import { factory } from '../../../src/adapters/factories'
import { ConfigService } from '../../../src/services/config.service'
import { dropDatabase } from '../../util/mongodb-util'
import { getConfig } from '../../util/settings'
import { before } from 'mocha'
import { initVerifyToken } from '../../../src'
import { IConfig } from '../../../src/interfaces'
import { ACTIVATE_USER_BY } from '../../../src/constant'
import { UsersManagement } from '../../../src/adapters/business-logic/users-management'

// public/private keys generated by:
// ssh-keygen -t rsa -b 1024 -m PEM -f authenzify-test-key
// ssh-keygen -f authenzify-test-key -e -m PKCS8 > authenzify-test-key.pub

describe('Permissions', () => {
  let config: IConfig
  let credentials
  before(async () => {
    config = await getConfig()
    const { USER_EMAIL, USER_PASSWORD } = process.env
    credentials = { email: USER_EMAIL, password: USER_PASSWORD }
    const storageConfig = config.storage
    //  await dropDatabase(storageConfig)
  })

  describe(`Initialize Permissions`, () => {
    it('Should create application permissions', async () => {
      const configService = new ConfigService(config)
      const usersManagements = (await factory(configService)) as UsersManagement
      const permissionsResponse = await usersManagements.initializePermissions([
        {
          name: 'change-password',
          isDeleted: false,
          description: 'Allow the user to change is password',
        },
      ])
      console.log(permissionsResponse)
      //    assert.equal(encoded.email, credentials.email)
    })
  })
})
