import { IUser, IDalUsersService } from '../../../interfaces'
import { TUserDetails, TVerificationDetails } from '../../../types'
import { IUserClean, IVerification } from '../../../interfaces/IUser'
import { IDalVerificationsService } from '../../../interfaces/IUsersService'
import { TModelsCollections } from '../../databases/mongodb/types'
import { mapMongoDbId } from './mongodb-util'
import { userInfo } from 'os'

export class MongoUsersService implements IDalUsersService {
  #modelsCollections: TModelsCollections

  constructor(modelsCollections: TModelsCollections) {
    this.#modelsCollections = modelsCollections
  }
  async verifyUser(user: IUser, verification: IVerification): Promise<any> {
    const session = await this.#modelsCollections.connection.startSession()

    try {
      // await session.withTransaction(async () => {
      const userUpdatedRes = await this.#modelsCollections.User.updateOne(
        { _id: user.id },
        { isValid: true },
        { session },
      )

      const verificationUpdatedRes =
        await this.#modelsCollections.Verification.updateOne(
          { _id: verification.id },
          { isDeleted: true },
          { session },
        )
      //await session.commitTransaction()
      const userUpdated = await this.#modelsCollections.User.findById(user.id)
      const verificationUpdated =
        await this.#modelsCollections.Verification.findById(verification.id)
      return { userUpdated, verificationUpdated }
      //})
    } catch (error) {
      //await session.abortTransaction()
      throw error
    }
  }
  async getTransaction(): Promise<any> {
    const transaction = await this.#modelsCollections.User.startSession()
    return transaction
  }

  async findById({ id }: { id: string }): Promise<IUser> {
    const user = (await this.#modelsCollections.User.findById(id))?.toObject()
    return mapMongoDbId(user)
  }

  find(filter: any): Promise<[IUser]> {
    return this.#modelsCollections.User.find(filter)
  }

  async findOne({ email }: { email: string }): Promise<IUser> {
    const user = (
      await this.#modelsCollections.User.findOne({
        email,
      })
    )?.toObject()
    return user ? mapMongoDbId(user) : user
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
