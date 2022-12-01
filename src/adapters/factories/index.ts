import { initMongoDalUsersService } from './mongodb'
import { UsersService } from '../../services/users.service'
import { ConfigService } from '../../services/config.service'
import { Services } from '../../types'

export const factory = async (
  configService: ConfigService,
): Promise<Services> => {
  //if (configService.storage === 'mongodb') {
  const iDalUsersService = await initMongoDalUsersService({
    uri: configService.uri,
  })
  const Users = new UsersService(configService, iDalUsersService)
  return {
    Users,
  }
  //}
}
