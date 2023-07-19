import {
  TEmail,
  TPassword,
  TUserDetails,
  TPasswordInfo,
  TSignUp,
  TSignInEmail,
} from '../types'
import { IUser, IUserClean } from './IUser'
import { IVerification } from './IVerificationService'

export interface IDalUsersService {
  findOne({ email }: { email: TEmail }): Promise<IUser>
  findById(id: string): Promise<IUser>
  create(user: TUserDetails): Promise<IUserClean>
  find(filter: any): Promise<[IUser]>
  verifyUser(user: IUserClean, verification: IVerification): Promise<any>
}

export interface IUserServiceEncryption {
  encrypt({ password }: { password: TPassword }): Promise<TPasswordInfo>
}

export interface IUserServiceValidation {
  doesUsernamePolicyValid({ email }: { email: TEmail }): Promise<Boolean>
  doesPasswordPolicyValid({
    password,
  }: {
    password: TPassword
  }): Promise<Boolean>
}

export interface IUsersService {
  findById(id: string): Promise<IUser>
}

export interface IUsersManagementService {
  signUp(userDetails: TSignUp): Promise<IUserClean>
  signIn(credentials: TSignInEmail): Promise<String>
  getUser({ id }: { id: string }): Promise<IUserClean>
  verifyUser(user: IUserClean, verification: IVerification): Promise<any>
}

export interface IUsersServiceEmitter {
  onSignUp(onSignUpFunction: Function): void
  onSignIn(onSignInFunction: Function): void
}
