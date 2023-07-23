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
var _MongoVerificationsService_modelsCollections;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoVerificationsService = void 0;
const mongodb_util_1 = require("./mongodb-util");
class MongoVerificationsService {
    constructor(modelsCollections) {
        _MongoVerificationsService_modelsCollections.set(this, void 0);
        __classPrivateFieldSet(this, _MongoVerificationsService_modelsCollections, modelsCollections, "f");
    }
    delete(id) {
        return __classPrivateFieldGet(this, _MongoVerificationsService_modelsCollections, "f").Verification.updateOne({
            _id: id,
        }, { isDeleted: true });
    }
    findByUserId({ userId, type, }) {
        return __classPrivateFieldGet(this, _MongoVerificationsService_modelsCollections, "f").Verification.findOne({
            userId,
            type,
        })?.toObject();
    }
    async findById({ id }) {
        const verification = (await __classPrivateFieldGet(this, _MongoVerificationsService_modelsCollections, "f").Verification.findOne({ id }))?.toObject();
        return (0, mongodb_util_1.mapMongoDbId)(verification);
    }
    find(filter) {
        return __classPrivateFieldGet(this, _MongoVerificationsService_modelsCollections, "f").Verification.find(filter);
    }
    async findOne({ id, type }) {
        const user = await __classPrivateFieldGet(this, _MongoVerificationsService_modelsCollections, "f").Verification.findOne({
            id,
            type,
        });
        return user?.toObject();
    }
    async create(verification) {
        return __classPrivateFieldGet(this, _MongoVerificationsService_modelsCollections, "f").Verification.create(verification);
    }
}
exports.MongoVerificationsService = MongoVerificationsService;
_MongoVerificationsService_modelsCollections = new WeakMap();
//# sourceMappingURL=VerificationsService.js.map