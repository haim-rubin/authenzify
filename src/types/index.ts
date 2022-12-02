import { HttpStatusClasses, HttpStatusExtra } from 'http-status'
import { UsersService } from '../services/users.service'

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

export type Services = {
  Users: UsersService
}

export type ServicesEvents = Services & {
  events: any
}
