import { IUserClean } from '../interfaces/IUser'
export const cleanUser = (user: IUserClean) => {
  const { isDeleted, isValid, ...userClean } = user
  return userClean
}
