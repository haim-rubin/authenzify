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
        },
      ]
      const permissions = await usersManagements.initializePermissions(
        permissionsToCreate,
      )
      const permission = await usersManagements.getPermissionByName({
        name: permissionsToCreate[0].name,
      })

      assert.equal(permission.id, permissions[0].id)
    })
  })
})
