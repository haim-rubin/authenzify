import { IUser, IUserClean } from '../interfaces/IUser'
import { IVerification } from '../interfaces/IVerificationService'
import { IUsersService, IDalUsersService } from '../interfaces'
import { IUserDetails, TEmail } from '../types'
import { ConfigService } from './config.service'

export class UsersService implements IUsersService {
  #config: ConfigService
  #iDalUsersService: IDalUsersService

  constructor(config: ConfigService, iDalUsersService: IDalUsersService) {
    this.#config = config
    this.#iDalUsersService = iDalUsersService
  }

  findById(id: string): Promise<IUser> {
    return this.#iDalUsersService.findById(id)
  }
  verifyUser(user: IUserClean, verification: IVerification): Promise<any> {
    return this.#iDalUsersService.verifyUser(user, verification)
  }

  async create(userDetails: IUserDetails) {
    return this.#iDalUsersService.create(userDetails)
  }

  async findOne({ email }: { email: TEmail }): Promise<IUser> {
    return this.#iDalUsersService.findOne({ email })
  }

  async updateUser({ id }: { id }, userDetails: any) {
    return this.#iDalUsersService.updateUser({ id }, userDetails)
  }
}
