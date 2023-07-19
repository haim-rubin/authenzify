import { IPermission } from './IPermissionService'
export interface IPermissionsGroup {
  id: string
  tenantId: string
  name: string
  permission: [IPermission]
}

export interface IDalPermissionsGroupsService {
  findOne({
    id,
    tenantId,
  }: {
    id: string
    tenantId: string
  }): Promise<IPermissionsGroup> // Retrieves specific permission groups

  findByUserId({
    id,
    tenantId,
  }: {
    id: string
    tenantId: string
  }): Promise<[IPermission]> // Retrieves all permission groups of user
  createPermissionsGroup(permissionDetails: IPermissionsGroup)
  findByTenantId(id: string): Promise<[IPermission]> // Retrieves all permission groups of tenant
  create(permission: IPermission): Promise<IPermission>
  find({
    tenant,
    filter,
  }: {
    tenant: string
    filter: any
  }): Promise<[IPermission]>
  delete(id: string)
}

export interface IPermissionService {}
