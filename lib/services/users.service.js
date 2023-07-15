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
var _UsersService_config, _UsersService_iDalUsersService;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
class UsersService {
    constructor(config, iDalUsersService) {
        _UsersService_config.set(this, void 0);
        _UsersService_iDalUsersService.set(this, void 0);
        __classPrivateFieldSet(this, _UsersService_config, config, "f");
        __classPrivateFieldSet(this, _UsersService_iDalUsersService, iDalUsersService, "f");
    }
    findById(id) {
        return __classPrivateFieldGet(this, _UsersService_iDalUsersService, "f").findById(id);
    }
    verifyUser(user, verification) {
        return __classPrivateFieldGet(this, _UsersService_iDalUsersService, "f").verifyUser(user, verification);
    }
    async create(userDetails) {
        return __classPrivateFieldGet(this, _UsersService_iDalUsersService, "f").create(userDetails);
    }
    async findOne({ email }) {
        return __classPrivateFieldGet(this, _UsersService_iDalUsersService, "f").findOne({ email });
    }
}
exports.UsersService = UsersService;
_UsersService_config = new WeakMap(), _UsersService_iDalUsersService = new WeakMap();
//# sourceMappingURL=users.service.js.map