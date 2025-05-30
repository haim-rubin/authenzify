import { mapMongoDbId } from '../adapters/factories/mongodb/mongodb-util'
import { IPermission, IPermissionBase } from '../interfaces/IPermissionService'
import { IDalPermissionsService } from '../interfaces/IPermissionService'
import { TPermission, TPermissionsGroup } from '../types'
import { ConfigService } from './config.service'
import {
  IDalPermissionsGroupsService,
  IPermissionsGroup,
} from '../interfaces/IPermissionGroupService'
import { generatePermissionId } from '../util/record-id-prefixes'

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
    const permission = await this.#iDalPermissionsService.createPermission(
      permissionDetails,
    )

    return permission
  }

  async findPermission({ id }: { id: string }): Promise<IPermission> {
    const permission = await this.#iDalPermissionsService.findPermission({
      id,
    })

    return permission
  }

  async findPermissions(filter?: any): Promise<IPermission[]> {
    const permissions = await this.#iDalPermissionsService.findPermissions(
      filter,
    )
    return permissions
  }

  async deletePermission({ id }: { id: any }) {
    const permission = await this.#iDalPermissionsService.deletePermission({
      id,
    })
    return permission
  }

  async createPermissionsGroup(
    permissionDetails: TPermissionsGroup,
  ): Promise<IPermissionsGroup> {
    const permission = await this.#iDalPermissionsGroupsService.createGroup(
      permissionDetails,
    )

    return mapMongoDbId(permission)
  }

  async findPermissionsGroups({
    tenantId,
    filter,
  }: {
    tenantId: string
    filter?: any
  }): Promise<IPermissionsGroup[]> {
    const permissionsGroups =
      await this.#iDalPermissionsGroupsService.findGroups({
        filter,
        tenantId,
      })

    return permissionsGroups
  }

  async findPermissionsGroup({
    tenantId,
    id,
  }: {
    tenantId: string
    id: any
  }): Promise<IPermissionsGroup> {
    const permissionGroups = await this.#iDalPermissionsGroupsService.findGroup(
      {
        tenantId,
        id,
      },
    )
    return mapMongoDbId(permissionGroups)
  }

  async deletePermissionsGroup({
    tenantId,
    id,
  }: {
    tenantId: string
    id: any
  }) {
    const permission = await this.#iDalPermissionsGroupsService.deleteGroup({
      id,
      tenantId,
    })
    return permission
  }

  async findPermissionsByNames({
    permissionNames,
  }: {
    permissionNames: string[]
  }) {
    const permissionsByNames =
      await this.#iDalPermissionsService.findPermissionsByNames({
        permissionNames,
      })
    return permissionsByNames.map(({ _doc }) => _doc)
  }

  async findPermissionsGroupsByNames({
    tenantId,
    names,
  }: {
    tenantId: string
    names: string[]
  }) {
    const permissionsGroupsByNames =
      await this.#iDalPermissionsGroupsService.findPermissionsGroupsByNames({
        tenantId,
        names,
      })
    return permissionsGroupsByNames
  }
  async findPermissionByName({ name }: { name: string }) {
    const permission = await this.#iDalPermissionsService.findPermissionByName({
      name,
    })

    return permission
  }
  async initializePermissions(permissions: IPermissionBase[]) {
    const existingPermissions: IPermission[] =
      await this.findPermissionsByNames({
        permissionNames: permissions.map(({ name }) => name),
      })
    const createPermissionResults = await Promise.all(
      permissions
        .filter(
          ({ name }) =>
            !existingPermissions.length ||
            !existingPermissions.find((ep) => ep.name === name),
        )
        .map(({ name, description, isDeleted, isBase }) => {
          return this.createPermission({
            id: generatePermissionId(),
            name,
            description,
            isDeleted,
            isBase,
          })
        }),
    )

    const permissionsUpdated = await this.findPermissions()
    return permissionsUpdated
  }
}
