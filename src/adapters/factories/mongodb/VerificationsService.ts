import { TVerificationDetails } from '../../../types'
import { IVerification } from '../../../interfaces/IVerificationService'
import { IDalVerificationsService } from '../../../interfaces/IVerificationService'
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
    return this.#modelsCollections.Verification.findOne({
      userId,
      type,
    })?.toObject()
  }

  async findById({ id }): Promise<IVerification> {
    const verification = (
      await this.#modelsCollections.Verification.findOne({ id })
    )?.toObject()

    return mapMongoDbId(verification)
  }

  find(filter: any): Promise<[IVerification]> {
    return this.#modelsCollections.Verification.find(filter)
  }

  async findOne({ id, type }): Promise<IVerification> {
    const user = await this.#modelsCollections.Verification.findOne({
      id,
      type,
    })

    return user?.toObject()
  }

  async create(verification: TVerificationDetails): Promise<IVerification> {
    return this.#modelsCollections.Verification.create(verification)
  }
}
