import {
  TEmail,
  TPassword,
  TUserDetails,
  TPasswordInfo,
  TSignUp,
  TSignInEmail,
} from '../types'
import { IUser, IUserClean, IUserMinimal } from './IUser'

export interface IDalUsersService {
  findOne({ email }: { email: TEmail }): Promise<IUser>
  findById({ id }: { id: string }): Promise<IUser>
  create(user: TUserDetails): Promise<IUserClean>
  find(filter: any): Promise<[IUser]>
}

export interface IUsersService {
  encrypt({ password }: { password: TPassword }): Promise<TPasswordInfo>
  doesUsernamePolicyValid({ email }: { email: TEmail }): Promise<Boolean>
  doesPasswordPolicyValid({
    password,
  }: {
    password: TPassword
  }): Promise<Boolean>
  signUp(userDetails: TSignUp): Promise<IUserMinimal>
  signIn(credentials: TSignInEmail): Promise<String>
}

export interface IUsersServiceEmitter {
  onSignUp(onSignUpFunction: Function): void
  onSignIn(user: IUserClean): void
}
