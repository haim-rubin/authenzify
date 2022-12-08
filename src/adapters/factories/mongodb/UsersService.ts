import { IUser, IDalUsersService } from '../../../interfaces'
import { TUserDetails, TVerificationDetails } from '../../../types'
import { IUserClean, IVerification } from '../../../interfaces/IUser'
import { IDalVerificationsService } from '../../../interfaces/IUsersService'
import { TModelsCollections } from '../../databases/mongodb/types'
import { mapMongoDbId } from './mongodb-util'

export class MongoUsersService implements IDalUsersService {
  #modelsCollections: TModelsCollections

  constructor(modelsCollections: TModelsCollections) {
    this.#modelsCollections = modelsCollections
  }

  async findById({ id }: { id: string }): Promise<IUser> {
    const user = (await this.#modelsCollections.User.findById(id)).toObject()
    return mapMongoDbId(user)
  }

  find(filter: any): Promise<[IUser]> {
    return this.#modelsCollections.User.find(filter)
  }

  findOne({ email }: { email: string }): Promise<IUser> {
    const user = this.#modelsCollections.User.findOne({ email })
    return user
  }

  map(user: any): IUserClean {
    const { id, email, firstName, lastName, username, isValid, isDeleted } =
      mapMongoDbId(user)

    return {
      email,
      firstName,
      lastName,
      id,
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
