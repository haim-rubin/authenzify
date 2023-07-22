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
    const permission = await this.#modelsCollections.Permission.findOne({
      id,
    })?.select()

    return permission
  }

  async findPermissionByName({ name }: { name: string }): Promise<IPermission> {
    const permission = await this.#modelsCollections.Permission.findOne({
      name,
    })

    return permission
  }

  async findAllPermissions(): Promise<IPermission[]> {
    const permissions = await this.#modelsCollections.Permission.find({})
    return permissions
  }

  async createPermission(permissionDetails: IPermission): Promise<IPermission> {
    const permission = await this.#modelsCollections.Permission.create(
      permissionDetails,
    )

    return permission
  }

  async findPermissions(filter: any): Promise<IPermission[]> {
    const permissions = await this.#modelsCollections.Permission.find(filter)
    return permissions ? permissions.map(({ _doc }) => _doc) : permissions
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
