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
var _MongoPermissionsGroupsService_modelsCollections;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoPermissionsGroupsService = void 0;
const mongodb_util_1 = require("./mongodb-util");
class MongoPermissionsGroupsService {
    constructor(modelsCollections) {
        _MongoPermissionsGroupsService_modelsCollections.set(this, void 0);
        __classPrivateFieldSet(this, _MongoPermissionsGroupsService_modelsCollections, modelsCollections, "f");
    }
    async findGroup({ id, tenantId, }) {
        const group = await __classPrivateFieldGet(this, _MongoPermissionsGroupsService_modelsCollections, "f").PermissionsGroup.findOne({
            tenantId,
            id,
        });
        return group;
    }
    async findGroupsByTenantId(tenantId) {
        const group = await __classPrivateFieldGet(this, _MongoPermissionsGroupsService_modelsCollections, "f").PermissionsGroup.find({
            tenantId,
        });
        return (0, mongodb_util_1.mapMongoDbId)(group);
    }
    async createGroup(permissionsGroupDetails) {
        const permissionsGroup = await __classPrivateFieldGet(this, _MongoPermissionsGroupsService_modelsCollections, "f").PermissionsGroup.create(permissionsGroupDetails);
        return permissionsGroup;
    }
    async findGroups({ tenantId, filter, }) {
        const permissionsGroups = await __classPrivateFieldGet(this, _MongoPermissionsGroupsService_modelsCollections, "f").PermissionsGroup.find({
            ...filter,
            tenantId,
        });
        return Array.isArray(permissionsGroups)
            ? permissionsGroups.map(({ _doc }) => _doc)
            : permissionsGroups;
    }
    async deleteGroup({ id, tenantId }) {
        const permissionsGroup = await __classPrivateFieldGet(this, _MongoPermissionsGroupsService_modelsCollections, "f").PermissionsGroup.updateOne({
            id,
            tenantId,
        }, { isDeleted: true });
        return permissionsGroup;
    }
}
exports.MongoPermissionsGroupsService = MongoPermissionsGroupsService;
_MongoPermissionsGroupsService_modelsCollections = new WeakMap();
//# sourceMappingURL=MongoPermissionsGroupsService.js.map