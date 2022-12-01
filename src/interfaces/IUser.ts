import { type } from 'os'

export interface IUserClean {
  id: String
  email: String
  firstName: String
  lastName: String
  username: String
  isValid: Boolean
  isDeleted: Boolean
}
export type TIUserClean = {
  id: String
  email: String
  firstName: String
  lastName: String
  username: String
}
export interface IUser extends IUserClean {
  password: String
  salt: string
}
