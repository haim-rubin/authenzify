import { IPermissionsGroup } from './IPermissionGroupService'

export interface IUserBase {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  tenantId?: string
  permissions?: string[]
  permissionsGroups?: string[]
  doesIsCompanyInitializedUser?: boolean
  extendedInfo?: any
  avatarUrl?: string
}
export interface IUserClean extends IUserBase {
  isValid: Boolean
  isDeleted: Boolean
}

export type TIUserClean = IUserBase
export interface IUser extends IUserClean {
  password: string
  salt: string
  signedUpVia: string
  signedInVia: string
}
