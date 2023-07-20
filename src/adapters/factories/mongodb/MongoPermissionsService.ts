import { IDalPermissionsService } from '../../../interfaces'
import { TModelsCollections } from '../../databases/mongodb/types'
import { mapMongoDbId } from './mongodb-util'
import { IPermission } from '../../../interfaces/IPermissionService'
import { IPermissionsGroup } from '../../../interfaces/IPermissionGroupService'

export class MongoPermissionsService implements IDalPermissionsService {
  #modelsCollections: TModelsCollections

  constructor(modelsCollections: TModelsCollections) {
    this.#modelsCollections = modelsCollections
  }

  async findPermission({ id }: { id: string }): Promise<IPermission> {
    const permission = (
      await this.#modelsCollections.Permission.findOne({ id })
    )?.toObject()
    return mapMongoDbId(permission)
  }

  async findAllPermissions(): Promise<[IPermission]> {
    const permissions = (
      await this.#modelsCollections.Permission.find({})
    )?.toObject()
    return mapMongoDbId(permissions)
  }

  async createPermission(permissionDetails: IPermission): Promise<IPermission> {
    const permission = await this.#modelsCollections.Permission.create(
      permissionDetails,
    )

    return permission
  }

  async findPermissions({ filter }: { filter: any }): Promise<[IPermission]> {
    const permissions = await this.#modelsCollections.Permission.find({
      ...filter,
    })
    return permissions
  }

  async deletePermission({ id }: { id: string }) {
    const permissions = await this.#modelsCollections.Permission.updateOne(
      {
        id,
      },
      { isDeleted: true },
    )
    return permissions
  }

  async findGroup({
    id,
    tenantId,
  }: {
    id: string
    tenantId: string
  }): Promise<IPermissionsGroup> {
    const group = await this.#modelsCollections.PermissionsGroup.findOne({
      tenantId,
      id,
    })

    return mapMongoDbId(group)
  }

  async findGroupsByTenantId(tenantId: string): Promise<[IPermissionsGroup]> {
    const group = (
      await this.#modelsCollections.PermissionsGroup.find({ tenantId })
    )?.toObject()
    return mapMongoDbId(group)
  }

  async createGroup(
    permissionsGroupDetails: IPermissionsGroup,
  ): Promise<IPermissionsGroup> {
    const permissionsGroup = (
      await this.#modelsCollections.PermissionsGroup.create(
        permissionsGroupDetails,
      )
    )?.toObject()
    return permissionsGroup
  }
  async findGroups({
    tenantId,
    filter,
  }: {
    tenantId: string
    filter: any
  }): Promise<[IPermissionsGroup]> {
    const permissionsGroups =
      await this.#modelsCollections.PermissionsGroup.find({
        ...filter,
        tenantId,
      })
    return permissionsGroups
  }
  async deleteGroup({ id, tenantId }: { id: string; tenantId: string }) {
    const permissionsGroup =
      await this.#modelsCollections.PermissionsGroup.updateOne(
        {
          id,
          tenantId,
        },
        { isDeleted: true },
      )
    return permissionsGroup
  }

  async getTransaction(): Promise<any> {
    const transaction = await this.#modelsCollections.User.startSession()
    return transaction
  }
  async findPermissionsByNames({
    permissionNames,
  }: {
    permissionNames: string[]
  }) {
    const existingPermissions = await this.#modelsCollections.Permission.find({
      name: { $in: permissionNames },
    })
    return existingPermissions
  }
}
