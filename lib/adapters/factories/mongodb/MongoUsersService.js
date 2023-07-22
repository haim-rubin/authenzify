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
var _MongoUsersService_modelsCollections;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoUsersService = void 0;
const mongodb_util_1 = require("./mongodb-util");
class MongoUsersService {
    constructor(modelsCollections) {
        _MongoUsersService_modelsCollections.set(this, void 0);
        __classPrivateFieldSet(this, _MongoUsersService_modelsCollections, modelsCollections, "f");
    }
    async updateUser({ id }, userDetails) {
        const userUpdatedRes = await __classPrivateFieldGet(this, _MongoUsersService_modelsCollections, "f").User.updateOne({ _id: id }, userDetails);
        return userUpdatedRes;
    }
    async verifyUser(user, verification) {
        const session = await __classPrivateFieldGet(this, _MongoUsersService_modelsCollections, "f").connection.startSession();
        try {
            const userUpdatedRes = await __classPrivateFieldGet(this, _MongoUsersService_modelsCollections, "f").User.updateOne({ _id: user.id }, { isValid: true }, { session });
            const verificationUpdatedRes = await __classPrivateFieldGet(this, _MongoUsersService_modelsCollections, "f").Verification.updateOne({ _id: verification.id }, { isDeleted: true }, { session });
            //await session.commitTransaction()
            const userUpdated = await __classPrivateFieldGet(this, _MongoUsersService_modelsCollections, "f").User.findById(user.id);
            const verificationUpdated = await __classPrivateFieldGet(this, _MongoUsersService_modelsCollections, "f").Verification.findById(verification.id);
            return { userUpdated, verificationUpdated };
            //})
        }
        catch (error) {
            //await session.abortTransaction()
            throw error;
        }
    }
    async getTransaction() {
        const transaction = await __classPrivateFieldGet(this, _MongoUsersService_modelsCollections, "f").User.startSession();
        return transaction;
    }
    async findById(id) {
        const user = (await __classPrivateFieldGet(this, _MongoUsersService_modelsCollections, "f").User.findById(id))?.toObject();
        return (0, mongodb_util_1.mapMongoDbId)(user);
    }
    find(filter) {
        return __classPrivateFieldGet(this, _MongoUsersService_modelsCollections, "f").User.find(filter);
    }
    async findOne({ email }) {
        const user = (await __classPrivateFieldGet(this, _MongoUsersService_modelsCollections, "f").User.findOne({
            email,
        }))?.toObject();
        return user ? (0, mongodb_util_1.mapMongoDbId)(user) : user;
    }
    map(user) {
        const { id, email, firstName, lastName, username, isValid, isDeleted, permissions, permissionsGroups, } = (0, mongodb_util_1.mapMongoDbId)(user);
        return {
            email,
            firstName,
            lastName,
            id,
            username,
            isValid,
            isDeleted,
            permissions,
            permissionsGroups,
        };
    }
    async create(userDetails) {
        const user = await __classPrivateFieldGet(this, _MongoUsersService_modelsCollections, "f").User.create(userDetails);
        return this.map(user.toObject());
    }
}
exports.MongoUsersService = MongoUsersService;
_MongoUsersService_modelsCollections = new WeakMap();
//# sourceMappingURL=MongoUsersService.js.map