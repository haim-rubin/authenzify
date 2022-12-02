import { initMongoDalUsersService } from './mongodb'
import { UsersService } from '../../services/users.service'
import { ConfigService } from '../../services/config.service'
import { Services, ServicesEvents } from '../../types'

const getEvents = (services: Services) => {
  return {
    Users: {
      onSignUp: services.Users.onSignUp,
      onSignIn: services.Users.onSignIn,
      onSignUpError: services.Users.onSignUpError,
    },
  }
}

export const factory = async (
  configService: ConfigService,
): Promise<ServicesEvents> => {
  if (true || configService.storage === 'mongodb') {
    const iDalUsersService = await initMongoDalUsersService({
      uri: configService.uri,
    })
    const Users = new UsersService(configService, iDalUsersService)
    const events = getEvents({ Users })
    return {
      Users,
      events,
    }
  }
}
