import {
  TEmail,
  TPassword,
  IUserDetails,
  TPasswordInfo,
  TSignUp,
  TSignInEmail,
} from '../types'
import { IUser, IUserClean } from './IUser'
import { IVerification } from './IVerificationService'

export interface IDalUsersService {
  findOne({ email }: { email: TEmail }): Promise<IUser>
  findById(id: string): Promise<IUser>
  create(user: IUserDetails): Promise<IUserClean>
  find(filter: any): Promise<IUserClean[]>
  verifyUser(user: IUserClean, verification: IVerification): Promise<any>
  updateUser({ id }: { id: string }, userDetails: any)
  createGoogleUser(user: any): Promise<IUserClean>
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
