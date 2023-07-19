import { mapMongoDbId } from '../adapters/factories/mongodb/mongodb-util'
import { VERIFICATION_TYPES } from '../constant'
import { IPermission } from '../interfaces/IPermissionService'
import { IDalPermissionsService } from '../interfaces/IPermissionService'
import { TPermission, TPermissionGroup } from '../types'
import { ConfigService } from './config.service'
import {
  IDalPermissionsGroupsService,
  IPermissionsGroup,
} from '../interfaces/IPermissionGroupService'

export class PermissionsService {
  #iDalPermissionsService: IDalPermissionsService
  #iDalPermissionsGroupsService: IDalPermissionsGroupsService
  #config: ConfigService

  constructor(
    config: ConfigService,
    iDalPermissionsService: IDalPermissionsService,
    iDalPermissionsGroupsService: IDalPermissionsGroupsService,
  ) {
    this.#config = config
    this.#iDalPermissionsService = iDalPermissionsService
    this.#iDalPermissionsGroupsService = iDalPermissionsGroupsService
  }

  async createPermission(permissionDetails: TPermission): Promise<IPermission> {
    const permission = await this.#iDalPermissionsService.create(
      permissionDetails,
    )

    return mapMongoDbId(permission)
  }

  async createPermissionsGroup(
    permissionDetails: TPermissionGroup,
  ): Promise<IPermissionsGroup> {
    const permission =
      await this.#iDalPermissionsGroupsService.createPermissionsGroup(
        permissionDetails,
      )

    return mapMongoDbId(permission)
  }

  async findOne(filter): Promise<IPermission> {
    const permission = await this.#iDalPermissionsService.findOne(filter)

    return permission ? mapMongoDbId(permission) : permission
  }

  async findByUserId({
    id,
    tenantId,
  }: {
    id: string
    tenantId: string
  }): Promise<IPermission> {
    const permission = await this.#iDalPermissionsService.findOne({
      id,
      tenantId,
    })
    return mapMongoDbId(permission)
  }

  async find(filter: any): Promise<Array<IPermission>> {
    const permissions = await this.#iDalPermissionsService.find(filter)
    return permissions.map(mapMongoDbId)
  }

  async delete(id: string) {
    const permission = await this.#iDalPermissionsService.delete(id)
    return permission
  }
}
