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
var _ConfigService_config, _ConfigService_passwordPolicyRegex, _ConfigService_usernamePolicyRegex;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const constant_1 = require("../constant");
const defaultConfig = {
    activateUserBy: constant_1.ACTIVATE_USER_BY.AUTO,
    storage: 'mongodb',
    uri: 'mongodb://localhost:27017/authenzify-users-management',
    saltLength: 32,
    authorizationCookieKey: 'Authorization',
    setCookieOnSignIn: true,
};
const defaultSaltLength = 32;
class ConfigService {
    constructor(config) {
        _ConfigService_config.set(this, void 0);
        _ConfigService_passwordPolicyRegex.set(this, void 0);
        _ConfigService_usernamePolicyRegex.set(this, void 0);
        __classPrivateFieldSet(this, _ConfigService_config, { ...defaultConfig, ...config }, "f");
        __classPrivateFieldSet(this, _ConfigService_passwordPolicyRegex, new RegExp(config.passwordPolicy), "f");
        __classPrivateFieldSet(this, _ConfigService_usernamePolicyRegex, new RegExp(config.usernamePolicy), "f");
    }
    get activateUserAuto() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").activateUserBy === constant_1.ACTIVATE_USER_BY.AUTO;
    }
    get activateUserByEmail() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").activateUserBy === constant_1.ACTIVATE_USER_BY.USER_EMAIL;
    }
    get activateUserByAdmin() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").activateUserBy === constant_1.ACTIVATE_USER_BY.ADMIN_EMAIL;
    }
    get activateUserByCode() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").activateUserBy === constant_1.ACTIVATE_USER_BY.CODE;
    }
    get doesUsernamePolicyValid() {
        return __classPrivateFieldGet(this, _ConfigService_usernamePolicyRegex, "f").test.bind(__classPrivateFieldGet(this, _ConfigService_usernamePolicyRegex, "f"));
    }
    get doesPasswordPolicyValid() {
        return __classPrivateFieldGet(this, _ConfigService_passwordPolicyRegex, "f").test.bind(__classPrivateFieldGet(this, _ConfigService_passwordPolicyRegex, "f"));
    }
    get saltLength() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").saltLength || defaultSaltLength;
    }
    get passwordPrivateKey() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").passwordPrivateKey;
    }
    get privateKey() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").privateKey;
    }
    get publicKey() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").publicKey;
    }
    get storage() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").storage;
    }
    get uri() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").uri;
    }
    get jwtSignOptions() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").jwtOptions;
    }
    get jwtVerifyOptions() {
        return {
            ...__classPrivateFieldGet(this, _ConfigService_config, "f").jwtOptions,
            algorithm: [__classPrivateFieldGet(this, _ConfigService_config, "f").jwtOptions.algorithm],
        };
    }
    get authorizationCookieKey() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").authorizationCookieKey;
    }
    get setCookieOnSignIn() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").setCookieOnSignIn;
    }
    get emailProvider() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").emailProvider;
    }
    get clientDomain() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").clientDomain;
    }
    get domain() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").domain;
    }
    get applicationName() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").applicationName;
    }
    get activationVerificationRoute() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").activationVerificationRoute;
    }
    get usersRoutesPrefix() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").usersRoutesPrefix || '/v1/users';
    }
    get host() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").host || '0.0.0.0';
    }
    get port() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").port || 9090;
    }
    get defaultPermissionsSignUp() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").onSignUpFirstBasePermissions || [];
    }
    get permissionsGroups() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").permissionsGroups;
    }
    get permissionsVerificationRoute() {
        return __classPrivateFieldGet(this, _ConfigService_config, "f").permissionsVerificationRoute;
    }
}
exports.ConfigService = ConfigService;
_ConfigService_config = new WeakMap(), _ConfigService_passwordPolicyRegex = new WeakMap(), _ConfigService_usernamePolicyRegex = new WeakMap();
//# sourceMappingURL=config.service.js.map