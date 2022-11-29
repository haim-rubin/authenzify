import { UserSchema } from '../databases/mongodb/entities/schema'
import { initModelsCollections } from '../databases/mongodb/initialize-models-collections'
import { connect } from '../databases/mongodb/connection'
import { IUser, IDalUsersService } from '../../interfaces'
import { TUserDetails } from '../../types'
import { TModelsCollections } from '../databases/mongodb/types'

export const initMongoDb = async ({
  uri,
}: {
  uri: string
}): Promise<TModelsCollections> => {
  const connection = await connect(uri)
  const modelsCollections = initModelsCollections({
    connection,
    modelsInfo: [
      {
        modelInfo: { key: 'User', schema: UserSchema },
        collectionInfo: { name: 'user', alias: 'users' },
      },
    ],
  })

  return modelsCollections
}

export class MongoUserService implements IDalUsersService {
  #modelsCollections

  constructor(modelsCollections: TModelsCollections) {
    this.#modelsCollections = modelsCollections
  }

  findOne({ username }: { username: string }): Promise<IUser> {
    const user = this.#modelsCollections.users.findOne({ username })
    return user
  }

  create(userDetails: TUserDetails): Promise<IUser> {
    const user = this.#modelsCollections.User.create(userDetails)
    return user
  }
}

export const initMongoDalUsersService = async ({
  uri,
}: {
  uri: string
}): Promise<IDalUsersService> => {
  const modelsCollections = await initMongoDb({ uri })
  const iDalUserService = new MongoUserService(modelsCollections)
  return iDalUserService
}
