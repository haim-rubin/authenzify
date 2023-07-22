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
var _UsersManagement_services, _UsersManagement_configService;
Object.defineProperty(exports, "__esModule", { value: true });
exports.initUsersManagement = exports.UsersManagement = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const constant_1 = require("../../constant");
const error_codes_1 = require("../../errors/error-codes");
const HttpError_1 = require("../../errors/HttpError");
const users_service_events_1 = require("../../events/users-service.events");
const emitter_1 = require("../../services/emitter");
const encryption_1 = require("../../util/encryption");
const add_emails_notifications_listeners_1 = require("../factories/email-notifications/add-emails-notifications-listeners");
const mapToMinimal = (user) => {
    const { username, firstName, lastName, email, id, isDeleted, isValid, permissions, permissionsGroups, } = user;
    const userMinimal = {
        username,
        firstName,
        lastName,
        email,
        id,
        isDeleted,
        isValid,
        permissions,
        permissionsGroups,
    };
    return userMinimal;
};
class UsersManagement {
    constructor({ services, configService, }) {
        _UsersManagement_services.set(this, void 0);
        _UsersManagement_configService.set(this, void 0);
        this.verifyActivation = async (verificationId) => {
            const verification = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Verifications.findOne({
                _id: verificationId,
                type: constant_1.VERIFICATION_TYPES.SIGN_UP,
                isDeleted: false,
            });
            if (!verification) {
                throw new HttpError_1.default(error_codes_1.SIGN_UP_ERRORS.INVALID_ACTION);
            }
            if (verification.isDeleted) {
                throw new HttpError_1.default(error_codes_1.SIGN_UP_ERRORS.INVALID_ACTION);
            }
            const user = await this.getUser({ id: verification.userId });
            if (!user) {
                throw new HttpError_1.default(error_codes_1.SIGN_UP_ERRORS.USER_DOES_NOT_EXISTS);
            }
            if (user.isDeleted) {
                throw new HttpError_1.default(error_codes_1.SIGN_UP_ERRORS.USER_DOES_NOT_EXISTS);
            }
            const res = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.verifyUser(user, verification);
            return true;
        };
        __classPrivateFieldSet(this, _UsersManagement_services, services, "f");
        __classPrivateFieldSet(this, _UsersManagement_configService, configService, "f");
    }
    doesUsernamePolicyValid({ email }) {
        return Promise.resolve(__classPrivateFieldGet(this, _UsersManagement_configService, "f").doesUsernamePolicyValid(email));
    }
    doesPasswordPolicyValid({ password, }) {
        return Promise.resolve(__classPrivateFieldGet(this, _UsersManagement_configService, "f").doesPasswordPolicyValid(password));
    }
    async encrypt({ password }) {
        const salt = (0, encryption_1.getSaltHex)(__classPrivateFieldGet(this, _UsersManagement_configService, "f").saltLength);
        const passwordEncrypted = await (0, encryption_1.encrypt)({
            expression: password,
            salt,
            passwordPrivateKey: __classPrivateFieldGet(this, _UsersManagement_configService, "f").passwordPrivateKey,
        });
        return {
            password: passwordEncrypted,
            salt,
        };
    }
    async innerSignUp(userDetails) {
        try {
            const { email, password } = userDetails;
            const usernamePolicyIsValid = await __classPrivateFieldGet(this, _UsersManagement_configService, "f").doesUsernamePolicyValid(email);
            if (!usernamePolicyIsValid) {
                throw new HttpError_1.default(error_codes_1.SIGN_UP_ERRORS.INVALID_USERNAME_POLICY);
            }
            const passwordPolicyIsValid = await __classPrivateFieldGet(this, _UsersManagement_configService, "f").doesPasswordPolicyValid(password);
            if (!passwordPolicyIsValid) {
                throw new HttpError_1.default(error_codes_1.SIGN_UP_ERRORS.INVALID_PASSWORD_POLICY);
            }
            const exists = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.findOne({ email });
            if (exists) {
                throw new HttpError_1.default(error_codes_1.SIGN_UP_ERRORS.USER_ALREADY_EXISTS);
            }
            const encryptedPassword = await this.encrypt({ password });
            const defaultPermissionsSignUp = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Permissions.findPermissions({ isBase: true });
            const user = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.create({
                ...userDetails,
                ...encryptedPassword,
                isValid: __classPrivateFieldGet(this, _UsersManagement_configService, "f").activateUserAuto,
                permissions: defaultPermissionsSignUp.map(({ name }) => name),
            });
            const userClean = mapToMinimal(user);
            return userClean;
        }
        catch (error) {
            throw error;
        }
    }
    verifyToken(token) {
        const decoded = (0, jsonwebtoken_1.verify)(token, __classPrivateFieldGet(this, _UsersManagement_configService, "f").publicKey, __classPrivateFieldGet(this, _UsersManagement_configService, "f").jwtVerifyOptions);
        return decoded;
    }
    async verifyUser(user, verification) {
        const res = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.verifyUser(user, verification);
        return res;
    }
    createVerification(verificationDetails) {
        return __classPrivateFieldGet(this, _UsersManagement_services, "f").Verifications.createVerification(verificationDetails);
    }
    async getUser({ id }) {
        const user = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.findById(id);
        const { id: uid, email, firstName, lastName, username, isValid, isDeleted, } = user;
        return {
            id: uid,
            email,
            firstName,
            lastName,
            username,
            isValid,
            isDeleted,
        };
    }
    async signUp(userDetails) {
        try {
            const user = await this.innerSignUp(userDetails);
            emitter_1.emitter.emit(users_service_events_1.USERS_SERVICE_EVENTS.USER_SIGN_UP, user);
            return user;
        }
        catch (error) {
            emitter_1.emitter.emit(users_service_events_1.USERS_SERVICE_EVENTS.USER_SIGN_UP_ERROR, error);
            throw error;
        }
    }
    async innerSignIn(credentials) {
        const user = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.findOne({
            email: credentials.email,
        });
        if (!user) {
            throw new HttpError_1.default(error_codes_1.SIGN_IN_ERRORS.USER_NOT_EXIST);
        }
        const { id, email, firstName, lastName, username, isValid, isDeleted, permissions, } = user;
        if (isDeleted) {
            throw new HttpError_1.default(error_codes_1.SIGN_IN_ERRORS.USER_DELETED);
        }
        if (!isValid) {
            throw new HttpError_1.default(error_codes_1.SIGN_IN_ERRORS.USER_NOT_VERIFIED);
        }
        const isMatch = await (0, encryption_1.doesPasswordMatch)({
            password: credentials.password,
            encryptedPassword: user.password,
            salt: user.salt,
            passwordPrivateKey: __classPrivateFieldGet(this, _UsersManagement_configService, "f").passwordPrivateKey,
        });
        if (!isMatch) {
            throw new HttpError_1.default(error_codes_1.SIGN_IN_ERRORS.INVALID_USERNAME_OR_PASSWORD);
        }
        const token = (0, jsonwebtoken_1.sign)({
            id,
            email,
            firstName,
            lastName,
            username,
            permissions,
        }, __classPrivateFieldGet(this, _UsersManagement_configService, "f").privateKey, __classPrivateFieldGet(this, _UsersManagement_configService, "f").jwtSignOptions);
        return token;
    }
    async signIn(credentials) {
        try {
            const token = await this.innerSignIn(credentials);
            emitter_1.emitter.emit(users_service_events_1.USERS_SERVICE_EVENTS.USER_SIGN_IN, token);
            return token;
        }
        catch (error) {
            emitter_1.emitter.emit(users_service_events_1.USERS_SERVICE_EVENTS.USER_SIGN_IN_ERROR, error);
            throw error;
        }
    }
    //#region Permissions
    async addPermission(permission) {
        const createResponse = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Permissions.createPermission(permission);
        return createResponse;
    }
    async addPermissionGroup(permissionGroup) {
        const createResponse = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Permissions.createPermissionsGroup(permissionGroup);
        return createResponse;
    }
    async deletePermission({ id }) {
        const deleteResponse = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Permissions.deletePermission({
            id,
        });
        return deleteResponse;
    }
    async deletePermissionsGroup({ tenantId, id, }) {
        const deleteResponse = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Permissions.deletePermissionsGroup({ tenantId, id });
        return deleteResponse;
    }
    async getPermission({ id }) {
        const permission = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Permissions.findPermission({
            id,
        });
        return permission;
    }
    async getPermissionByName({ name }) {
        const permission = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Permissions.findPermissionByName({
            name,
        });
        return permission;
    }
    async getPermissions(filter) {
        const permissions = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Permissions.findPermissions(filter);
        return permissions;
    }
    async getPermissionsGroup({ tenantId, id, }) {
        const permissionsGroup = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Permissions.findPermissionsGroup({
            tenantId,
            id,
        });
        return permissionsGroup;
    }
    async getPermissionsGroups({ tenantId, filter, }) {
        const permissionsGroups = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Permissions.findPermissionsGroups({
            tenantId,
            filter,
        });
        return permissionsGroups;
    }
    async initializePermissions(permissions) {
        return __classPrivateFieldGet(this, _UsersManagement_services, "f").Permissions.initializePermissions(permissions);
    }
    //#endregion
    //#region Events
    onSignUp(onSignUpFunction) {
        emitter_1.emitter.addListener(users_service_events_1.USERS_SERVICE_EVENTS.USER_SIGN_UP, onSignUpFunction);
    }
    onSignUpError(onSignUpFunction) {
        emitter_1.emitter.addListener(users_service_events_1.USERS_SERVICE_EVENTS.USER_SIGN_UP_ERROR, onSignUpFunction);
    }
    onSignIn(onSignInFunction) {
        emitter_1.emitter.addListener(users_service_events_1.USERS_SERVICE_EVENTS.USER_SIGN_IN, onSignInFunction);
    }
}
exports.UsersManagement = UsersManagement;
_UsersManagement_services = new WeakMap(), _UsersManagement_configService = new WeakMap();
const initUsersManagement = async ({ services, configService, }) => {
    const usersManagement = new UsersManagement({
        services,
        configService,
    });
    await (0, add_emails_notifications_listeners_1.addEmailsNotificationsListeners)({ configService, usersManagement });
    return usersManagement;
};
exports.initUsersManagement = initUsersManagement;
//# sourceMappingURL=users-management.js.map