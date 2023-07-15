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
var _VerificationsService_iDalVerificationsService, _VerificationsService_config;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationsService = void 0;
const mongodb_util_1 = require("../adapters/factories/mongodb/mongodb-util");
class VerificationsService {
    constructor(config, iDalVerificationsService) {
        _VerificationsService_iDalVerificationsService.set(this, void 0);
        _VerificationsService_config.set(this, void 0);
        __classPrivateFieldSet(this, _VerificationsService_config, config, "f");
        __classPrivateFieldSet(this, _VerificationsService_iDalVerificationsService, iDalVerificationsService, "f");
    }
    async createVerification(verificationDetails) {
        const verification = await __classPrivateFieldGet(this, _VerificationsService_iDalVerificationsService, "f").create(verificationDetails);
        return (0, mongodb_util_1.mapMongoDbId)(verification);
    }
    async findOne(filter) {
        const verification = await __classPrivateFieldGet(this, _VerificationsService_iDalVerificationsService, "f").findOne(filter);
        return verification ? (0, mongodb_util_1.mapMongoDbId)(verification) : verification;
    }
    async findByUserId({ id, type, isDeleted, }) {
        const verification = await __classPrivateFieldGet(this, _VerificationsService_iDalVerificationsService, "f").findOne({
            id,
            type,
            isDeleted,
        });
        return (0, mongodb_util_1.mapMongoDbId)(verification);
    }
    async find(filter) {
        const verifications = await __classPrivateFieldGet(this, _VerificationsService_iDalVerificationsService, "f").find(filter);
        return verifications.map(mongodb_util_1.mapMongoDbId);
    }
    async delete(id) {
        const verification = await __classPrivateFieldGet(this, _VerificationsService_iDalVerificationsService, "f").delete(id);
        return verification;
    }
}
exports.VerificationsService = VerificationsService;
_VerificationsService_iDalVerificationsService = new WeakMap(), _VerificationsService_config = new WeakMap();
//# sourceMappingURL=verifications.service.js.map