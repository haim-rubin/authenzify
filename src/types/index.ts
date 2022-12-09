import { HttpStatusClasses, HttpStatusExtra } from 'http-status'
import { UsersService } from '../services/users.service'
import { VerificationsService } from '../services/verifications.service'

export type TPassword = string
export type TEmail = string

export type TSignUp = {
  email: TEmail
  password: TPassword
  firstName?: string
  lastName?: string
}

export type TSignInEmail = {
  email: TEmail
  password: TPassword
}

export type THttpError = {
  httpStatusCode: number
  code: string
  httpStatusText: string | number | HttpStatusClasses | HttpStatusExtra
}

export type TPasswordInfo = {
  password: TPassword
  salt: String
}

export interface TUserDetails extends TSignUp, TPasswordInfo {
  isValid: Boolean
}

export type ServicesEvents = {
  Users: {
    onSignUp(onSignUpFunction: Function): void
    onSignIn(onSignUpFunction: Function): void
    onSignUpError(onSignUpFunction: Function): void
  }
}

export type Services = {
  Users: UsersService
  Verifications: VerificationsService
}

export type TVerificationDetails = {
  userId: string
  type: string
}
