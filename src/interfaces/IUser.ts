export interface IUserClean {
  id: String
  username: String
  firstName: String
  lastName: String
  email: String
}
export interface IUser extends IUserClean {
  isValid: Boolean
  isDeleted: Boolean
  password: String
  salt: string
}
