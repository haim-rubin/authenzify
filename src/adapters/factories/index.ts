import { initMongoDalServices } from './mongodb'
import { UsersService } from '../../services/users.service'
import { ConfigService } from '../../services/config.service'
import { Services } from '../../types'
import { VerificationsService } from '../../services/verifications.service'
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

  const { iDalUsersService, iDalVerificationsService } =
    await initMongoDalServices({
      config: configService.storage,
    })

  const Users = new UsersService(configService, iDalUsersService)

  const Verifications = new VerificationsService(
    configService,
    iDalVerificationsService,
  )

  const services: Services = {
    Users,
    Verifications,
  }
  return initUsersManagement({ services, configService })
}
