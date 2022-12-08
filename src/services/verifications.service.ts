import { mapMongoDbId } from '../adapters/factories/mongodb/mongodb-util'
import { IVerification } from '../interfaces/IUser'
import { IDalVerificationsService } from '../interfaces/IUsersService'
import { TVerificationDetails } from '../types'
import { ConfigService } from './config.service'

export class VerificationsService {
  #iDalVerificationsService: IDalVerificationsService
  #config: ConfigService

  constructor(
    config: ConfigService,
    iDalVerificationsService: IDalVerificationsService,
  ) {
    this.#config = config
    this.#iDalVerificationsService = iDalVerificationsService
  }

  async findOne({ id, type }): Promise<IVerification> {
    const verification = await this.#iDalVerificationsService.findOne({
      id,
      type,
    })
    return mapMongoDbId(verification)
  }

  async findByUserId({
    id,
    type,
  }: {
    id: string
    type: string
  }): Promise<IVerification> {
    const verification = await this.#iDalVerificationsService.findOne({
      id,
      type,
    })
    return mapMongoDbId(verification)
  }

  async create(
    verificationDetails: TVerificationDetails,
  ): Promise<IVerification> {
    const verification = await this.#iDalVerificationsService.create(
      verificationDetails,
    )
    return mapMongoDbId(verification)
  }

  async find(filter: any): Promise<Array<IVerification>> {
    const verifications = await this.#iDalVerificationsService.find(filter)
    return verifications.map(mapMongoDbId)
  }
}
