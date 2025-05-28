import { IUserClean } from '../interfaces/IUser'
export const cleanUser = (user: IUserClean) => {
  const { isDeleted, isValid, ...userClean } = user
  return userClean
}

export const unique = (item, index, array) => array.indexOf(item) === index
