import { IUser, IDalUsersService } from '../../../interfaces'
import { TUserDetails } from '../../../types'
export class MongoDbUsersService implements IDalUsersService {
  findOne({ username }: { username: string }): Promise<IUser> {
    throw new Error('Method not implemented.')
  }

  create(user: TUserDetails): Promise<IUser> {
    throw new Error('Method not implemented.')
  }
}
