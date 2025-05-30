import { initMongoDalServices } from './mongodb'
import { UsersService } from '../../services/users.service'
import { ConfigService } from '../../services/config.service'
import { Services } from '../../types'
import { VerificationsService } from '../../services/verifications.service'
import { PermissionsService } from '../../services/permissions.service'
import {
  initUsersManagement,
  UsersManagement,
} from '../business-logic/users-management'

const SUPPORTED_STORAGES = {
  mongodb: true,
}

export const factory = async (
  configService: ConfigService,
): Promise<UsersManagement> => {
  if (!SUPPORTED_STORAGES[configService.storage.type]) {
    throw new Error(`${configService.storage.type} storage not supported yet`)
  }

  const {
    iDalUsersService,
    iDalVerificationsService,
    iDalPermissionsService,
    iDalPermissionsGroupsService,
  } = await initMongoDalServices({
    config: configService.storage,
  })

  const Users = new UsersService(configService, iDalUsersService)

  const Verifications = new VerificationsService(
    configService,
    iDalVerificationsService,
  )

  const Permissions = new PermissionsService(
    configService,
    iDalPermissionsService,
    iDalPermissionsGroupsService,
  )
  //const Permissions = new PermissionsService(configService,)
  const services: Services = {
    Users,
    Verifications,
    Permissions,
  }
  return initUsersManagement({ services, configService })
}
