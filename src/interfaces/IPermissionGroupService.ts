import { IPermission } from './IPermissionService'
export interface IPermissionsGroup {
  id: string
  tenantId: string
  name: string
  permissions: string[]
  isDeleted: boolean
}

export interface IDalPermissionsGroupsService {
  /* Permissions Groups */
  findGroup({
    id,
    tenantId,
  }: {
    id: string
    tenantId: string
  }): Promise<IPermissionsGroup> // Retrieves specific permission
  findGroupsByTenantId(tenantId: string): Promise<IPermissionsGroup[]> // Retrieves all permissions of tenant
  createGroup(permission: IPermissionsGroup): Promise<IPermissionsGroup>
  findGroups({
    tenantId,
    filter,
  }: {
    tenantId: string
    filter?: any
  }): Promise<IPermissionsGroup[]>
  deleteGroup({ id, tenantId }: { id: string; tenantId: string })

  findGroup({
    id,
    tenantId,
  }: {
    id: string
    tenantId: string
  }): Promise<IPermissionsGroup> // Retrieves specific permission
  findGroupsByTenantId(tenantId: string): Promise<IPermissionsGroup[]> // Retrieves all permissions of tenant
  createGroup(permission: IPermissionsGroup): Promise<IPermissionsGroup>
  findGroups({
    tenantId,
    filter,
  }: {
    tenantId: string
    filter: any
  }): Promise<IPermissionsGroup[]>
  deleteGroup({ id, tenantId }: { id: string; tenantId: string })
  findPermissionsGroupsByNames({
    tenantId,
    names,
  }: {
    tenantId: string
    names: string[]
  }): Promise<IPermissionsGroup[]>
}

export interface IPermissionService {}
