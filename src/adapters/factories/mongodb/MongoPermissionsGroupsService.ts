import { TModelsCollections } from '../../databases/mongodb/types'
import { mapMongoDbId } from './mongodb-util'
import {
  IDalPermissionsGroupsService,
  IPermissionsGroup,
} from '../../../interfaces/IPermissionGroupService'

export class MongoPermissionsGroupsService
  implements IDalPermissionsGroupsService
{
  #modelsCollections: TModelsCollections

  constructor(modelsCollections: TModelsCollections) {
    this.#modelsCollections = modelsCollections
  }
  async findPermissionsGroupsByNames({
    tenantId,
    names,
  }: {
    tenantId: string
    names: string[]
  }): Promise<IPermissionsGroup[]> {
    const existingPermissionsGroups =
      await this.#modelsCollections.PermissionsGroup.find({
        tenantId,
        name: { $in: names },
      })
    return existingPermissionsGroups
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

    return group
  }

  async findGroupsByTenantId(tenantId: string): Promise<IPermissionsGroup[]> {
    const group = await this.#modelsCollections.PermissionsGroup.find({
      tenantId,
    })

    return mapMongoDbId(group)
  }

  async createGroup(
    permissionsGroupDetails: IPermissionsGroup,
  ): Promise<IPermissionsGroup> {
    const permissionsGroup =
      await this.#modelsCollections.PermissionsGroup.create(
        permissionsGroupDetails,
      )

    return permissionsGroup
  }
  async findGroups({
    tenantId,
    filter,
  }: {
    tenantId: string
    filter: any
  }): Promise<IPermissionsGroup[]> {
    const permissionsGroups =
      await this.#modelsCollections.PermissionsGroup.find({
        ...filter,
        tenantId,
      })
    return Array.isArray(permissionsGroups)
      ? permissionsGroups.map(({ _doc }) => _doc)
      : permissionsGroups
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
}
