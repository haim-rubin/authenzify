import { UsersService } from '../services/users.service'

export type TPassword = string
export type TUsername = string

export type TSignUp = {
  username: TUsername
  password: TPassword
}

export type THttpError = {
  httpStatusCode: number
  code: string
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
