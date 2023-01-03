import { type } from 'os'

export interface IUserClean {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  isValid: Boolean
  isDeleted: Boolean
}

export type TIUserClean = {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
}
export interface IUser extends IUserClean {
  password: string
  salt: string
}

export interface IVerification {
  id: string
  userId: string
  type: string
  isDeleted: boolean
}
