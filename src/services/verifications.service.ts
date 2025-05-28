import { mapMongoDbId } from '../adapters/factories/mongodb/mongodb-util'
import { VERIFICATION_TYPES } from '../constant'
import { IVerification } from '../interfaces/IVerificationService'
import {
  IDalVerificationsService,
  IVerificationsService,
} from '../interfaces/IVerificationService'

import { TVerificationDetails } from '../types'
import { ConfigService } from './config.service'

export class VerificationsService implements IVerificationsService {
  #iDalVerificationsService: IDalVerificationsService
  #config: ConfigService

  constructor(
    config: ConfigService,
    iDalVerificationsService: IDalVerificationsService,
  ) {
    this.#config = config
    this.#iDalVerificationsService = iDalVerificationsService
  }

  async createVerification(
    verificationDetails: TVerificationDetails,
  ): Promise<IVerification> {
    const verification = await this.#iDalVerificationsService.create(
      verificationDetails,
    )

    return mapMongoDbId(verification)
  }

  async findOne(filter): Promise<IVerification> {
    const verification = await this.#iDalVerificationsService.findOne(filter)

    return verification ? mapMongoDbId(verification) : verification
  }

  async findByUserId({
    id,
    type,
    isDeleted,
  }: {
    id: string
    type: string
    isDeleted: boolean
  }): Promise<IVerification> {
    const verification = await this.#iDalVerificationsService.findOne({
      id,
      type,
      isDeleted,
    })
    return mapMongoDbId(verification)
  }

  async find(filter: any): Promise<Array<IVerification>> {
    const verifications = await this.#iDalVerificationsService.find(filter)
    return verifications.map(mapMongoDbId)
  }

  async delete(id: string) {
    const verification = await this.#iDalVerificationsService.delete(id)
    return verification
  }
}
