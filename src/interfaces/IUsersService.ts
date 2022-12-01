import { TEmail, TPassword, TUserDetails, TPasswordInfo } from '../types'
import { IUser, IUserClean } from './IUser'

export interface IDalUsersService {
  findOne({ email }: { email: TEmail }): Promise<IUser>
  create(user: TUserDetails): Promise<IUserClean>
  find(filter: any): Promise<[IUser]>
}

export interface IUsersService {
  encrypt({ password }: { password: TPassword }): Promise<TPasswordInfo>
  isUsernamePolicyValid({ email }: { email: TEmail }): Promise<Boolean>
  isPasswordPolicyValid({ password }: { password: TPassword }): Promise<Boolean>
}

export interface IUsersServiceEmitter {
  onSignUp(onSignUpFunction: Function): void
  onSignIn(user: IUserClean): void
}
