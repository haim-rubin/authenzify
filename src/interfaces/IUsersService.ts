import { TUsername, TPassword, TUserDetails, TPasswordInfo } from '../types'
import { IUser } from './IUser'

export interface IDalUsersService {
  findOne({ username }: { username: TUsername }): Promise<IUser>
  create(user: TUserDetails): Promise<IUser>
}

export interface IUsersService {
  encrypt({ password }: { password: TPassword }): Promise<TPasswordInfo>
  isUsernamePolicyValid({ username }: { username: TUsername }): Promise<Boolean>
  isPasswordPolicyValid({ password }: { password: TPassword }): Promise<Boolean>
}
