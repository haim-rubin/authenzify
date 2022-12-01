import { UserSchema } from '../databases/mongodb/entities/schema'
import { initModelsCollections } from '../databases/mongodb/initialize-models-collections'
import { connect } from '../databases/mongodb/connection'
import { IUser, IDalUsersService } from '../../interfaces'
import { TUserDetails } from '../../types'
import { TModelsCollections } from '../databases/mongodb/types'
import { IUserClean } from '../../interfaces/IUser'

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

export class MongoUsersService implements IDalUsersService {
  #modelsCollections

  constructor(modelsCollections: TModelsCollections) {
    this.#modelsCollections = modelsCollections
  }
  find(filter: any): Promise<[IUser]> {
    return this.#modelsCollections.User.find(filter)
  }

  findOne({ email }: { email: string }): Promise<IUser> {
    const user = this.#modelsCollections.User.findOne({ email })
    return user
  }

  map(user: any): IUserClean {
    const { _id, email, firstName, lastName, username, isValid, isDeleted } =
      user
    return {
      email,
      firstName,
      lastName,
      id: _id.toString(),
      username,
      isValid,
      isDeleted,
    }
  }

  async create(userDetails: TUserDetails): Promise<IUserClean> {
    const user = await this.#modelsCollections.User.create(userDetails)
    return this.map(user.toObject())
  }
}

export const initMongoDalUsersService = async ({
  uri,
}: {
  uri: string
}): Promise<IDalUsersService> => {
  const modelsCollections = await initMongoDb({ uri })
  const iDalUsersService = new MongoUsersService(modelsCollections)
  return iDalUsersService
}
