import { initMongoDalServices } from './mongodb'
import { UsersService } from '../../services/users.service'
import { ConfigService } from '../../services/config.service'
import { Services } from '../../types'
import { VerificationsService } from '../../services/verifications.service'
import {
  initUsersManagement,
  UsersManagement,
} from '../business-logic/users-management'

export const factory = async (
  configService: ConfigService,
): Promise<UsersManagement> => {
  if (true || configService.storage === 'mongodb') {
    const { iDalUsersService, iDalVerificationsService } =
      await initMongoDalServices({
        uri: configService.uri,
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
}
