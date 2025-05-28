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
var _MongoPermissionsService_modelsCollections;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoPermissionsService = void 0;
class MongoPermissionsService {
    constructor(modelsCollections) {
        _MongoPermissionsService_modelsCollections.set(this, void 0);
        __classPrivateFieldSet(this, _MongoPermissionsService_modelsCollections, modelsCollections, "f");
    }
    async findPermission({ id }) {
        const permission = await __classPrivateFieldGet(this, _MongoPermissionsService_modelsCollections, "f").Permission.findOne({
            id,
        })?.select();
        return permission;
    }
    async findPermissionByName({ name }) {
        const permission = await __classPrivateFieldGet(this, _MongoPermissionsService_modelsCollections, "f").Permission.findOne({
            name,
        });
        return permission;
    }
    async findAllPermissions() {
        const permissions = await __classPrivateFieldGet(this, _MongoPermissionsService_modelsCollections, "f").Permission.find({});
        return permissions;
    }
    async createPermission(permissionDetails) {
        const permission = await __classPrivateFieldGet(this, _MongoPermissionsService_modelsCollections, "f").Permission.create(permissionDetails);
        return permission;
    }
    async findPermissions(filter) {
        const permissions = await __classPrivateFieldGet(this, _MongoPermissionsService_modelsCollections, "f").Permission.find(filter);
        return permissions ? permissions.map(({ _doc }) => _doc) : permissions;
    }
    async deletePermission({ id }) {
        const permissions = await __classPrivateFieldGet(this, _MongoPermissionsService_modelsCollections, "f").Permission.updateOne({
            id,
        }, { isDeleted: true });
        return permissions;
    }
    async findPermissionsByNames({ permissionNames, }) {
        const existingPermissions = await __classPrivateFieldGet(this, _MongoPermissionsService_modelsCollections, "f").Permission.find({
            name: { $in: permissionNames },
        });
        return existingPermissions;
    }
}
exports.MongoPermissionsService = MongoPermissionsService;
_MongoPermissionsService_modelsCollections = new WeakMap();
//# sourceMappingURL=MongoPermissionsService.js.map