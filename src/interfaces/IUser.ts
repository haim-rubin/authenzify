import { IPermissionsGroup } from './IPermissionGroupService'
import { IPermission } from './IPermissionService'

export interface IUserBase {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  permissions?: IPermission[]
  permissionsGroups?: IPermissionsGroup[]
}
export interface IUserClean extends IUserBase {
  isValid: Boolean
  isDeleted: Boolean
}

export type TIUserClean = IUserBase
export interface IUser extends IUserClean {
  password: string
  salt: string
}
