export interface IPermissionBase {
  name: string
  description: string
  isDeleted: boolean
}
export interface IPermission extends IPermissionBase {
  id: string
}

export interface IDalPermissionsService {
  findPermission({ id }: { id: string }): Promise<IPermission> // Retrieves specific permission
  createPermission(permission: IPermission): Promise<IPermission>
  findPermissions(filter?: any): Promise<IPermission[]>
  deletePermission({ id }: { id: string })
  findPermissionsByNames({ permissionNames }: { permissionNames: string[] })
}

export interface IPermissionService {}
