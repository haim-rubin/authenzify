import { IPermissionsGroup } from './IPermissionGroupService'

export interface IPermission {
  id: string
  tenantId: string
  userId: string
  name: string
  description: string
  isDeleted: boolean
}

export interface IDalPermissionsService {
  findPermission({
    id,
    tenantId,
  }: {
    id: string
    tenantId: string
  }): Promise<IPermission> // Retrieves specific permission
  findPermissionsByTenantId(tenantId: string): Promise<[IPermission]> // Retrieves all permissions of tenant
  createPermission(permission: IPermission): Promise<IPermission>
  findPermissions({
    tenantId,
    filter,
  }: {
    tenantId: string
    filter: any
  }): Promise<[IPermission]>
  deletePermission({ id, tenantId }: { id: string; tenantId: string })

  /* Permissions Groups */
  findGroup({
    id,
    tenantId,
  }: {
    id: string
    tenantId: string
  }): Promise<IPermissionsGroup> // Retrieves specific permission
  findGroupsByTenantId(tenantId: string): Promise<[IPermissionsGroup]> // Retrieves all permissions of tenant
  createGroup(permission: IPermissionsGroup): Promise<IPermissionsGroup>
  findGroups({
    tenantId,
    filter,
  }: {
    tenantId: string
    filter: any
  }): Promise<[IPermissionsGroup]>
  deleteGroup({ id, tenantId }: { id: string; tenantId: string })
}

export interface IPermissionService {}
