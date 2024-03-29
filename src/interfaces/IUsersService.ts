import {
  TEmail,
  TPassword,
  TUserDetails,
  TPasswordInfo,
  TSignUp,
  TSignInEmail,
  TVerificationDetails,
} from '../types'
import { IUser, IUserClean, IVerification } from './IUser'

export interface IDalUsersService {
  findOne({ email }: { email: TEmail }): Promise<IUser>
  findById(id: string): Promise<IUser>
  create(user: TUserDetails): Promise<IUserClean>
  find(filter: any): Promise<[IUser]>
  verifyUser(user: IUserClean, verification: IVerification): Promise<any>
}

export interface IDalVerificationsService {
  findById({ id, type }: { id: string; type: string }): Promise<IVerification>
  findByUserId({
    userId,
    type,
  }: {
    userId: string
    type: string
  }): Promise<IVerification>
  findOne({
    id,
    type,
    isDeleted,
  }: {
    id: string
    type: string
    isDeleted: boolean
  }): Promise<IVerification>
  create(verification: TVerificationDetails): Promise<IVerification>
  find(filter: any): Promise<[IVerification]>
  delete(id: string): Promise<boolean>
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

export interface IVerificationsService {
  createVerification(
    verificationDetails: TVerificationDetails,
  ): Promise<IVerification>
}

export interface IUsersVerificationService {}

export interface IUsersServiceEmitter {
  onSignUp(onSignUpFunction: Function): void
  onSignIn(onSignInFunction: Function): void
}
