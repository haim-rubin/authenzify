import { initMongoDalServices } from './mongodb'
import { UsersService } from '../../services/users.service'
import { ConfigService } from '../../services/config.service'
import { Services, ServicesEvents } from '../../types'
import { VerificationsService } from '../../services/verifications.service'

const getEvents = ({ Users }: { Users: UsersService }): ServicesEvents => {
  return {
    Users: {
      onSignUp: Users.onSignUp,
      onSignIn: Users.onSignIn,
      onSignUpError: Users.onSignUpError,
    },
  }
}

export const factory = async (
  configService: ConfigService,
): Promise<Services> => {
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

    const events: ServicesEvents = getEvents({ Users })
    return {
      Users,
      events,
      Verifications,
    }
  }
}
