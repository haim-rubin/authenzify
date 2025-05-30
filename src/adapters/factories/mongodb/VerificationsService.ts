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
    return this.#modelsCollections.Verification.updateOne(
      {
        _id: id,
      },
      { isDeleted: true },
    )
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

  async findOne({ id, type, isDeleted }): Promise<IVerification> {
    const verification = await this.#modelsCollections.Verification.findOne({
      _id: id,
      type,
      isDeleted,
    })

    return verification?.toObject()
  }

  async create(verification: TVerificationDetails): Promise<IVerification> {
    return this.#modelsCollections.Verification.create(verification)
  }
}
