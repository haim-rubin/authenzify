import {
  TEmail,
  TPassword,
  TUserDetails,
  TPasswordInfo,
  TSignUp,
  TSignInEmail,
  TVerificationDetails,
} from '../types'
import { IUser, IUserClean, IUserMinimal, IVerification } from './IUser'

export interface IDalUsersService {
  findOne({ email }: { email: TEmail }): Promise<IUser>
  findById({ id }: { id: string }): Promise<IUser>
  create(user: TUserDetails): Promise<IUserClean>
  find(filter: any): Promise<[IUser]>
}

export interface IDalVerificationsService {
  findById({ id }): Promise<IVerification>
  findByUserId({
    userId,
    type,
  }: {
    userId: string
    type: string
  }): Promise<IVerification>
  findOne({ id, type }: { id: string; type: string }): Promise<IVerification>
  create(verification: TVerificationDetails): Promise<IVerification>
  find(filter: any): Promise<[IVerification]>
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
  onSignIn(onSignInFunction: Function): void
}
