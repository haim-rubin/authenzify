import { IUser, IDalUsersService } from '../../../interfaces'
import { TUserDetails, TVerificationDetails } from '../../../types'
import { IUserClean, IVerification } from '../../../interfaces/IUser'
import { IDalVerificationsService } from '../../../interfaces/IUsersService'
import { TModelsCollections } from '../../databases/mongodb/types'
import { mapMongoDbId } from './mongodb-util'

export class MongoVerificationsService implements IDalVerificationsService {
  #modelsCollections: TModelsCollections

  constructor(modelsCollections: TModelsCollections) {
    this.#modelsCollections = modelsCollections
  }
  delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  findByUserId({
    userId,
    type,
  }: {
    userId: string
    type: string
  }): Promise<IVerification> {
    return this.#modelsCollections.Verification.findOne({ userId, type })
  }

  async findById({ id }): Promise<IVerification> {
    const verification = (
      await this.#modelsCollections.Verification.findOne({ id })
    ).toObject()

    return mapMongoDbId(verification)
  }

  find(filter: any): Promise<[IVerification]> {
    return this.#modelsCollections.Verification.find(filter)
  }

  findOne({ id, type }): Promise<IVerification> {
    const user = this.#modelsCollections.Verification.findOne({ id, type })
    return user
  }

  async create(verification: TVerificationDetails): Promise<IVerification> {
    return this.#modelsCollections.Verification.create(verification)
  }
}
