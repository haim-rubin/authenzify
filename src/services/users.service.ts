import { IUser, IUserClean, IVerification } from '../interfaces/IUser'
import { IUsersService, IDalUsersService } from '../interfaces'
import { TUserDetails, TEmail, TSignInEmail, TSignUp } from '../types'
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

  async create(userDetails: TUserDetails) {
    return this.#iDalUsersService.create(userDetails)
  }

  async findOne({ email }: { email: TEmail }): Promise<IUser> {
    return this.#iDalUsersService.findOne({ email })
  }
}
