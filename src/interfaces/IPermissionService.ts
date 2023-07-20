export interface IPermissionBase {
  name: string
  description: string
  isDeleted: boolean
}
export interface IPermission extends IPermissionBase {
  id: string
}

export interface IDalPermissionsService {
  findPermission({ id }: { id: string }): Promise<IPermission> // Retrieves permission by id
  findPermissionByName({ name }: { name: string }): Promise<IPermission> // Retrieves permission by name
  createPermission(permission: IPermission): Promise<IPermission> // Create permission
  findPermissions(filter?: any): Promise<IPermission[]> // Retrieves permissions by filter
  deletePermission({ id }: { id: string }) // Mark permission as deleted
  findPermissionsByNames({ permissionNames }: { permissionNames: string[] }) // Retrieves permissions by names
}

export interface IPermissionService {}
