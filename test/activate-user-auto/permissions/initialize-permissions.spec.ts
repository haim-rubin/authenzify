import * as assert from 'assert'
import { factory } from '../../../src/adapters/factories'
import { ConfigService } from '../../../src/services/config.service'
import { dropDatabase } from '../../util/mongodb-util'
import { getConfig } from '../../util/settings'
import { before } from 'mocha'
import { IConfig } from '../../../src/interfaces'
import { UsersManagement } from '../../../src/adapters/business-logic/users-management'

describe('Permissions', () => {
  let config: IConfig
  let credentials
  before(async () => {
    config = await getConfig()
    const { USER_EMAIL, USER_PASSWORD } = process.env
    credentials = { email: USER_EMAIL, password: USER_PASSWORD }
    const storageConfig = config.storage
    await dropDatabase(storageConfig)
  })

  describe(`Initialize Permissions`, () => {
    it('Should create application permissions', async () => {
      const configService = new ConfigService(config)
      const usersManagements = (await factory(configService)) as UsersManagement
      const permissionsToCreate = [
        {
          name: 'change-password-editor',
          isDeleted: false,
          description: 'Allow the user to change is password',
          isBase: true,
        },
        {
          name: 'change-password-viewer',
          isDeleted: false,
          description: 'Allow the user to view change is password',
          isBase: true,
        },
      ]
      const permissionsResponse = await usersManagements.initializePermissions(
        permissionsToCreate,
      )

      const allExists = permissionsResponse.every((createdPermission) =>
        permissionsToCreate.find(({ name }) => createdPermission.name === name),
      )
      assert.equal(allExists, true)
    })
  })
})
