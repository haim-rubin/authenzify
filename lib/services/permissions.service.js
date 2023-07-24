"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PermissionsService_iDalPermissionsService, _PermissionsService_iDalPermissionsGroupsService, _PermissionsService_config;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsService = void 0;
const mongodb_util_1 = require("../adapters/factories/mongodb/mongodb-util");
const record_id_prefixes_1 = require("../util/record-id-prefixes");
class PermissionsService {
    constructor(config, iDalPermissionsService, iDalPermissionsGroupsService) {
        _PermissionsService_iDalPermissionsService.set(this, void 0);
        _PermissionsService_iDalPermissionsGroupsService.set(this, void 0);
        _PermissionsService_config.set(this, void 0);
        __classPrivateFieldSet(this, _PermissionsService_config, config, "f");
        __classPrivateFieldSet(this, _PermissionsService_iDalPermissionsService, iDalPermissionsService, "f");
        __classPrivateFieldSet(this, _PermissionsService_iDalPermissionsGroupsService, iDalPermissionsGroupsService, "f");
    }
    async createPermission(permissionDetails) {
        const permission = await __classPrivateFieldGet(this, _PermissionsService_iDalPermissionsService, "f").createPermission(permissionDetails);
        return permission;
    }
    async findPermission({ id }) {
        const permission = await __classPrivateFieldGet(this, _PermissionsService_iDalPermissionsService, "f").findPermission({
            id,
        });
        return permission;
    }
    async findPermissions(filter) {
        const permissions = await __classPrivateFieldGet(this, _PermissionsService_iDalPermissionsService, "f").findPermissions(filter);
        return permissions;
    }
    async deletePermission({ id }) {
        const permission = await __classPrivateFieldGet(this, _PermissionsService_iDalPermissionsService, "f").deletePermission({
            id,
        });
        return permission;
    }
    async createPermissionsGroup(permissionDetails) {
        const permission = await __classPrivateFieldGet(this, _PermissionsService_iDalPermissionsGroupsService, "f").createGroup(permissionDetails);
        return (0, mongodb_util_1.mapMongoDbId)(permission);
    }
    async findPermissionsGroups({ tenantId, filter, }) {
        const permissionsGroups = await __classPrivateFieldGet(this, _PermissionsService_iDalPermissionsGroupsService, "f").findGroups({
            filter,
            tenantId,
        });
        return permissionsGroups;
    }
    async findPermissionsGroup({ tenantId, id, }) {
        const permissionGroups = await __classPrivateFieldGet(this, _PermissionsService_iDalPermissionsGroupsService, "f").findGroup({
            tenantId,
            id,
        });
        return (0, mongodb_util_1.mapMongoDbId)(permissionGroups);
    }
    async deletePermissionsGroup({ tenantId, id, }) {
        const permission = await __classPrivateFieldGet(this, _PermissionsService_iDalPermissionsGroupsService, "f").deleteGroup({
            id,
            tenantId,
        });
        return permission;
    }
    async findPermissionsByNames({ permissionNames, }) {
        const permissionsByNames = await __classPrivateFieldGet(this, _PermissionsService_iDalPermissionsService, "f").findPermissionsByNames({
            permissionNames,
        });
        return permissionsByNames.map(({ _doc }) => _doc);
    }
    async findPermissionsGroupsByNames({ tenantId, names, }) {
        const permissionsGroupsByNames = await __classPrivateFieldGet(this, _PermissionsService_iDalPermissionsGroupsService, "f").findPermissionsGroupsByNames({
            tenantId,
            names,
        });
        return permissionsGroupsByNames;
    }
    async findPermissionByName({ name }) {
        const permission = await __classPrivateFieldGet(this, _PermissionsService_iDalPermissionsService, "f").findPermissionByName({
            name,
        });
        return permission;
    }
    async initializePermissions(permissions) {
        const existingPermissions = await this.findPermissionsByNames({
            permissionNames: permissions.map(({ name }) => name),
        });
        const createPermissionResults = await Promise.all(permissions
            .filter(({ name }) => !existingPermissions.length ||
            !existingPermissions.find((ep) => ep.name === name))
            .map(({ name, description, isDeleted, isBase }) => {
            return this.createPermission({
                id: (0, record_id_prefixes_1.generatePermissionId)(),
                name,
                description,
                isDeleted,
                isBase,
            });
        }));
        const permissionsUpdated = await this.findPermissions();
        return permissionsUpdated;
    }
}
exports.PermissionsService = PermissionsService;
_PermissionsService_iDalPermissionsService = new WeakMap(), _PermissionsService_iDalPermissionsGroupsService = new WeakMap(), _PermissionsService_config = new WeakMap();
//# sourceMappingURL=permissions.service.js.map