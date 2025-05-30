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
const record_id_prefixes_1 = require("../../util/record-id-prefixes");
const helpers_1 = require("../../util/helpers");
const google_1 = require("../providers/google");
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
                id: verificationId,
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
        this.getHighestRole = () => {
            const highestRoles = Object.entries(__classPrivateFieldGet(this, _UsersManagement_configService, "f").permissionsGroups)
                .filter(([_, value]) => value?.highest)
                .map(([name]) => ({ name }));
            return highestRoles;
        };
        this.setRequestedPermissions = async ({ adminUser, user, role }) => {
            const permissionsGroup = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Permissions.findPermissionsGroups({
                tenantId: adminUser.tenantId,
                filter: { name: role },
            });
            if (!permissionsGroup.find(({ name }) => name === role)) {
                throw new HttpError_1.default(error_codes_1.PERMISSIONS_ERRORS.ROLE_NOT_ALLOWED);
            }
            const res = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.updateUser({ id: user.id }, {
                tenantId: user.tenantId || adminUser.tenantId,
                permissionsGroups: permissionsGroup.map(({ name }) => name),
            });
            return res;
        };
        this.verifyUserPermissionRequest = async ({ verificationId, role, userInfo, }) => {
            const verification = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Verifications.findOne({
                id: verificationId,
                type: constant_1.VERIFICATION_TYPES.USER_PERMISSIONS_REQUEST,
                isDeleted: false,
            });
            if (!verification || verification.isDeleted) {
                throw new HttpError_1.default(error_codes_1.PERMISSIONS_ERRORS.INVALID_ACTION);
            }
            const { extraInfo: { adminEmail, userEmail, permissionsGroups }, } = verification;
            const user = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.findOne({ email: userEmail });
            if (!permissionsGroups.includes(role)) {
                throw new HttpError_1.default(error_codes_1.PERMISSIONS_ERRORS.ROLE_NOT_ALLOWED);
            }
            if (!this.doesTheUserIsValid({
                user,
            })) {
                throw new HttpError_1.default(error_codes_1.PERMISSIONS_ERRORS.USER_DOES_NOT_EXISTS);
            }
            const isUserAdminRequest = this.doesItTheAdminRequestThePermissions({
                user,
                adminEmail,
            });
            const adminUser = isUserAdminRequest
                ? user
                : await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.findOne({
                    email: adminEmail,
                });
            if (userInfo.id !== adminUser.id) {
                throw new HttpError_1.default(error_codes_1.PERMISSIONS_ERRORS.USER_NOT_ALLOWED);
            }
            // Check if the user that request the permissions doesn't have the right permission to approve
            if (!this.doesUserHasTheRightPermissionToApprove({ user })) {
                // If the user doesn't have the permissions so check if the user is also the admin
                // and if it does the admin so it's the same user and we shouldn't check again the permissions
                if (isUserAdminRequest) {
                    throw new HttpError_1.default(error_codes_1.PERMISSIONS_ERRORS.USER_NOT_ALLOWED);
                }
                else {
                    // This is for the case the user is not the admin so we need to check if the admin has the permission for approve the user
                    // First check existence of the admin user
                    if (!this.doesTheUserIsValid({
                        user: adminUser,
                    })) {
                        throw new HttpError_1.default(error_codes_1.PERMISSIONS_ERRORS.ADMIN_USER_DOES_NOT_EXISTS);
                    }
                    // Check if the adminUser has the right permission to approve the permissions for the user
                    if (!this.doesUserHasTheRightPermissionToApprove({ user: adminUser })) {
                        throw new HttpError_1.default(error_codes_1.PERMISSIONS_ERRORS.USER_NOT_ALLOWED);
                    }
                }
            }
            // Check if the requested role is exists this for making sure that the user didn't hack for role that it doesn't allow to
            await this.setRequestedPermissions({ adminUser, user, role });
            const deleteVerificationResponse = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Verifications.delete(verificationId);
            emitter_1.emitter.emit(users_service_events_1.USERS_SERVICE_EVENTS.USER_PERMISSIONS_APPROVED, {
                user,
                adminUser,
            });
            return true;
        };
        //#endregion Events
        this.loginUser = async ({ user, signedInVia }) => {
            const userInfo = await this.buildSignInUserInfo({ user });
            const token = (0, jsonwebtoken_1.sign)(userInfo, __classPrivateFieldGet(this, _UsersManagement_configService, "f").privateKey, __classPrivateFieldGet(this, _UsersManagement_configService, "f").jwtSignOptions);
            await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.updateUser({ id: user.id }, {
                lastLogin: new Date().getTime(),
                signedInVia,
            });
            return token;
        };
        __classPrivateFieldSet(this, _UsersManagement_services, services, "f");
        __classPrivateFieldSet(this, _UsersManagement_configService, configService, "f");
        this.googleApis = __classPrivateFieldGet(this, _UsersManagement_configService, "f").googleSignInClientId
            ? (0, google_1.googleApisProvider)({
                GOOGLE_CLIENT_ID: __classPrivateFieldGet(this, _UsersManagement_configService, "f").googleSignInClientId,
            })
            : null;
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
                signedUpVia: constant_1.USER_SIGNED_UP_OR_IN_BY.EMAIL,
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
    mapUser(user) {
        const { id: uid, email, firstName, lastName, username, isValid, isDeleted, tenantId, permissions, permissionsGroups, } = user;
        return {
            id: uid,
            email,
            firstName,
            lastName,
            username,
            isValid,
            isDeleted,
            tenantId,
            permissions,
            permissionsGroups,
        };
    }
    async getUser({ id }) {
        const user = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.findById(id);
        return user ? this.mapUser(user) : user;
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
    async buildSignInUserInfo({ user }) {
        const { id, email, firstName, lastName, username, permissions, tenantId, permissionsGroups, avatarUrl, } = user;
        const allPermissions = await this.getUserPermissions({
            tenantId,
            permissions,
            permissionsGroups,
        });
        return {
            id,
            email,
            firstName,
            lastName,
            username,
            tenantId,
            avatarUrl,
            permissions: allPermissions,
        };
    }
    async getUserPermissions({ tenantId, permissions, permissionsGroups }) {
        const permissionsGroupsFull = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Permissions.findPermissionsGroupsByNames({
            tenantId,
            names: permissionsGroups,
        });
        const permissionsFromGroups = permissionsGroupsFull
            .map(({ permissions }) => permissions)
            .flat()
            .map(({ name }) => name);
        const allPermissionsUnique = []
            .concat(permissionsFromGroups)
            .concat(permissions)
            .filter(helpers_1.unique);
        return allPermissionsUnique;
    }
    async innerSignIn(credentials) {
        const user = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.findOne({
            email: credentials.email,
        });
        if (!user) {
            throw new HttpError_1.default(error_codes_1.SIGN_IN_ERRORS.USER_NOT_EXIST);
        }
        const { isValid, isDeleted } = user;
        if (isDeleted) {
            throw new HttpError_1.default(error_codes_1.SIGN_IN_ERRORS.USER_DELETED);
        }
        if (!isValid) {
            throw new HttpError_1.default(error_codes_1.SIGN_IN_ERRORS.USER_NOT_VERIFIED);
        }
        if (!user.password) {
            throw new HttpError_1.default(error_codes_1.SIGN_IN_ERRORS.USER_DOES_NOT_HAVE_A_PASSWORD);
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
        const token = this.loginUser({
            user,
            signedInVia: constant_1.USER_SIGNED_UP_OR_IN_BY.EMAIL,
        });
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
    async changePassword({ password, newPassword, userInfo }) {
        if (!password?.trim() || !newPassword?.trim()) {
            throw new HttpError_1.default(error_codes_1.CHANGE_PASSWORD_ERRORS.INVALID_PASSWORD_POLICY);
        }
        const user = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.findOne({
            email: userInfo.email,
        });
        if (!user) {
            throw new HttpError_1.default(error_codes_1.CHANGE_PASSWORD_ERRORS.USER_NOT_EXIST);
        }
        if (user.isDeleted) {
            throw new HttpError_1.default(error_codes_1.CHANGE_PASSWORD_ERRORS.USER_NOT_EXIST);
        }
        if (!user.isValid) {
            throw new HttpError_1.default(error_codes_1.CHANGE_PASSWORD_ERRORS.USER_NOT_EXIST);
        }
        const isMatch = await (0, encryption_1.doesPasswordMatch)({
            password: password,
            encryptedPassword: user.password,
            salt: user.salt,
            passwordPrivateKey: __classPrivateFieldGet(this, _UsersManagement_configService, "f").passwordPrivateKey,
        });
        if (!isMatch) {
            throw new HttpError_1.default(error_codes_1.CHANGE_PASSWORD_ERRORS.INVALID_USERNAME_OR_PASSWORD);
        }
        const isNewPasswordMatch = await (0, encryption_1.doesPasswordMatch)({
            password: newPassword,
            encryptedPassword: user.password,
            salt: user.salt,
            passwordPrivateKey: __classPrivateFieldGet(this, _UsersManagement_configService, "f").passwordPrivateKey,
        });
        if (isNewPasswordMatch) {
            throw new HttpError_1.default(error_codes_1.CHANGE_PASSWORD_ERRORS.CANNOT_CHANGE_TO_THE_EXISTING_PASSWORD);
        }
        const passwordPolicyIsValid = await __classPrivateFieldGet(this, _UsersManagement_configService, "f").doesPasswordPolicyValid(newPassword);
        if (!passwordPolicyIsValid) {
            throw new HttpError_1.default(error_codes_1.CHANGE_PASSWORD_ERRORS.INVALID_PASSWORD_POLICY);
        }
        const encryptedPassword = await this.encrypt({ password: newPassword });
        const updatedUser = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.updateUser({ id: user.id }, encryptedPassword);
        return !!updatedUser?.modifiedCount;
    }
    async forgotPassword({ email }) {
        const user = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.findOne({
            email,
        });
        if (!user) {
            throw new HttpError_1.default(error_codes_1.FORGOT_PASSWORD_ERRORS.USER_NOT_EXIST);
        }
        if (user.isDeleted) {
            throw new HttpError_1.default(error_codes_1.FORGOT_PASSWORD_ERRORS.USER_DELETED);
        }
        if (!user.isValid) {
            throw new HttpError_1.default(error_codes_1.FORGOT_PASSWORD_ERRORS.USER_NOT_EXIST);
        }
        const verification = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Verifications.createVerification({
            userId: user.id,
            type: constant_1.VERIFICATION_TYPES.RESET_PASSWORD_REQUEST,
            extraInfo: {},
        });
        const notRequestedVerification = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Verifications.createVerification({
            userId: user.id,
            type: constant_1.VERIFICATION_TYPES.DID_NOT_REQUESTED_TO_RESET_PASSWORD,
            extraInfo: {},
        });
        emitter_1.emitter.emit(users_service_events_1.USERS_SERVICE_EVENTS.RESET_PASSWORD_REQUESTED, {
            user,
            verification,
            notRequestedVerification,
        });
        return true;
    }
    doesUserSignedUpWithGoogleAndFirstTimeResetPassword(user) {
        return (user.signedUpVia === constant_1.USER_SIGNED_UP_OR_IN_BY.GOOGLE &&
            !user.password &&
            !user.salt);
    }
    async applyForgotPassword({ verificationId, newPassword }) {
        const verification = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Verifications.findOne({
            id: verificationId,
            type: constant_1.VERIFICATION_TYPES.RESET_PASSWORD_REQUEST,
            isDeleted: false,
        });
        if (!verification || verification.isDeleted) {
            throw new HttpError_1.default(error_codes_1.CHANGE_PASSWORD_ERRORS.INVALID_ACTION);
        }
        const { userId } = verification;
        const user = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.findById(userId);
        if (!user) {
            throw new HttpError_1.default(error_codes_1.CHANGE_PASSWORD_ERRORS.USER_NOT_EXIST);
        }
        if (user.isDeleted) {
            throw new HttpError_1.default(error_codes_1.CHANGE_PASSWORD_ERRORS.USER_NOT_EXIST);
        }
        if (!user.isValid) {
            throw new HttpError_1.default(error_codes_1.CHANGE_PASSWORD_ERRORS.USER_NOT_EXIST);
        }
        if (!this.doesUserSignedUpWithGoogleAndFirstTimeResetPassword(user)) {
            const isMatch = await (0, encryption_1.doesPasswordMatch)({
                password: newPassword,
                encryptedPassword: user.password,
                salt: user.salt,
                passwordPrivateKey: __classPrivateFieldGet(this, _UsersManagement_configService, "f").passwordPrivateKey,
            });
            if (isMatch) {
                throw new HttpError_1.default(error_codes_1.CHANGE_PASSWORD_ERRORS.INVALID_PASSWORD_POLICY);
            }
        }
        const encryptedPassword = await this.encrypt({ password: newPassword });
        const updatedUser = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.updateUser({ id: user.id }, encryptedPassword);
        await __classPrivateFieldGet(this, _UsersManagement_services, "f").Verifications.delete(verificationId);
        return !!updatedUser?.modifiedCount;
    }
    //#region Permissions
    async addPermission(permission) {
        const createResponse = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Permissions.createPermission(permission);
        return createResponse;
    }
    async addPermissionsGroup(permissionGroup) {
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
    async createPermissionsGroupsForNewCompany({ tenantId, }) {
        const existing = await this.getPermissionsGroups({ tenantId });
        const existingNames = existing.map(({ name }) => name);
        const createPermissionsGroupsResponse = await Promise.all(Object.entries(__classPrivateFieldGet(this, _UsersManagement_configService, "f").permissionsGroups) // Taking roles from config
            .filter(([name]) => !existingNames.includes(name)) // Filter the existing roles (this for case that application roles already sets and now adding new)
            .map(([name, { permissions }]) => {
            //Creating the roles that doesn't exists
            return this.addPermissionsGroup({
                id: (0, record_id_prefixes_1.generatePermissionsGroupId)(),
                tenantId,
                name,
                isDeleted: false,
                permissions,
            });
        }));
        return createPermissionsGroupsResponse;
    }
    async combineAllUserPermissions(user) {
        const permissions = user.permissions || [];
        const groupPermissions = user.permissionsGroups?.map(({ permissions }) => permissions).flat() || [];
        return [].concat(permissions).concat(groupPermissions);
    }
    async throwIfNotAllowToApproveUsers({ adminUser, user, }) {
        // Case of permission for approve user didn't defined by the application
        if (!__classPrivateFieldGet(this, _UsersManagement_configService, "f").approvePermissionsByPermissionsName) {
            throw new HttpError_1.default(error_codes_1.PERMISSIONS_ERRORS.PERMISSION_FOR_APPROVE_USERS_NOT_DEFINED);
        }
        const allAdminPermissions = await this.getUserPermissions({
            tenantId: adminUser.tenantId,
            permissions: adminUser.permissions,
            permissionsGroups: adminUser.permissionsGroups,
        });
        // In case it has the right permissions
        const hasTheRightPermissionToApprove = allAdminPermissions.includes(__classPrivateFieldGet(this, _UsersManagement_configService, "f").approvePermissionsByPermissionsName);
        // Check the case if this is the first user's (doesIsCompanyInitializedUser) is asking permission,
        // in this case the user doesn't have yet the permission but he's the company owner user so he can approve himself
        if (!hasTheRightPermissionToApprove) {
            throw new HttpError_1.default(error_codes_1.PERMISSIONS_ERRORS.PERMISSION_CANNOT_INITIATE_BY_OTHER_USER);
        }
        return true;
    }
    throwIfUserIsNotValid({ userInfo, user, id }) {
        if (userInfo.id !== id) {
            throw new HttpError_1.default(error_codes_1.PERMISSIONS_ERRORS.PERMISSION_CANNOT_INITIATE_BY_OTHER_USER);
        }
        if (!user) {
            throw new HttpError_1.default(error_codes_1.PERMISSIONS_ERRORS.USER_DOES_NOT_EXISTS);
        }
        if (userInfo.email !== user.email) {
            throw new HttpError_1.default(error_codes_1.PERMISSIONS_ERRORS.INVALID_INITIATOR_EMAIL);
        }
    }
    throwIfAdminUserIsNotValid({ adminUser }) {
        if (!adminUser || adminUser.isDeleted || !adminUser.isValid) {
            throw new HttpError_1.default(error_codes_1.PERMISSIONS_ERRORS.ADMIN_USER_DOES_NOT_EXISTS);
        }
        return true;
    }
    async initializeNewCompanyPermissions({ id }) {
        // Case is the first user
        const tenantId = (0, record_id_prefixes_1.generateTenantId)();
        await this.createPermissionsGroupsForNewCompany({ tenantId });
        await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.updateUser({ id }, {
            tenantId,
            doesIsCompanyInitializedUser: true,
            $push: {
                permissions: __classPrivateFieldGet(this, _UsersManagement_configService, "f").approvePermissionsByPermissionsName,
            },
        });
        return __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.findById(id);
    }
    doesItTheAdminRequestThePermissions({ user, adminEmail }) {
        return user.email === adminEmail;
    }
    userRegisterAsNewCompany({ adminEmail, user }) {
        return (this.doesItTheAdminRequestThePermissions({ user, adminEmail }) &&
            !user.tenantId);
    }
    async getAvailablePermissionsForUser({ user, adminUser }) {
        const isTheFirstUser = user.email === adminUser.email;
        if (isTheFirstUser) {
            return this.getHighestRole();
        }
        const permissionsGroups = await this.getPermissionsGroups({
            tenantId: adminUser.tenantId,
            filter: {},
        });
        return permissionsGroups;
    }
    async createUserPermissionsVerification({ id, adminUser, user }) {
        const permissionsGroups = await this.getAvailablePermissionsForUser({
            user,
            adminUser,
        });
        const verificationExists = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Verifications.findByUserId({
            id,
            type: constant_1.VERIFICATION_TYPES.USER_PERMISSIONS_REQUEST,
            isDeleted: false,
        });
        if (verificationExists) {
            await __classPrivateFieldGet(this, _UsersManagement_services, "f").Verifications.delete(verificationExists.id);
        }
        const anonymousRoles = Object.entries(__classPrivateFieldGet(this, _UsersManagement_configService, "f").permissionsGroups)
            .filter(([_, value]) => value.anonymousRole)
            .map(([name]) => name);
        const verification = await this.createVerification({
            userId: id,
            type: constant_1.VERIFICATION_TYPES.USER_PERMISSIONS_REQUEST,
            extraInfo: {
                adminEmail: adminUser.email,
                userEmail: user.email,
                permissionsGroups: permissionsGroups
                    .filter(({ name }) => !anonymousRoles.includes(name))
                    .map(({ name }) => name),
            },
        });
        return { verification, permissionsGroups };
    }
    async requestPermissionForUser({ id, companyDetails, userInfo }) {
        const user = await this.getUser({ id });
        this.throwIfUserIsNotValid({ userInfo, user, id });
        const { email: adminEmail } = companyDetails;
        const adminUser = (await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.findOne({
            email: adminEmail,
        }));
        if (this.userRegisterAsNewCompany({ adminEmail, user })) {
            const updatedAdminUser = await this.initializeNewCompanyPermissions({
                id,
            });
            if (__classPrivateFieldGet(this, _UsersManagement_configService, "f").skipFirstCompanyUserSelectsRoleByEmail) {
                const highestRoles = this.getHighestRole();
                const [role] = highestRoles;
                await this.setRequestedPermissions({
                    adminUser: updatedAdminUser,
                    user: updatedAdminUser,
                    role: role.name,
                });
                const updateUserWithPermissions = (await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.findOne({
                    email: adminEmail,
                }));
                const token = await this.loginUser({
                    user: updateUserWithPermissions,
                    signedInVia: constant_1.USER_SIGNED_UP_OR_IN_BY.SYSTEM,
                });
                return { token, isAdminUser: true };
            }
        }
        else {
            await this.throwIfAdminUserIsNotValid({ adminUser });
            await this.throwIfNotAllowToApproveUsers({ adminUser, user });
        }
        const { verification, permissionsGroups } = await this.createUserPermissionsVerification({ id, adminUser, user });
        emitter_1.emitter.emit(users_service_events_1.USERS_SERVICE_EVENTS.USER_PERMISSIONS_REQUESTED, {
            permissionsGroups,
            verification,
            user,
            adminEmail: companyDetails.email,
        });
        return { isAdminUser: false, token: null };
    }
    doesTheUserIsValid({ user }) {
        return user && !user.isDeleted && user.isValid;
    }
    doesUserHasTheRightPermissionToApprove({ user }) {
        const { permissions, permissionsGroups = [] } = user;
        const permissionsFromGroups = Object.entries(__classPrivateFieldGet(this, _UsersManagement_configService, "f").permissionsGroups)
            .filter(([role]) => permissionsGroups.includes(role))
            .map(([_, { permissions }]) => permissions)
            .flat()
            .map(({ name }) => name);
        return []
            .concat(permissions)
            .concat(permissionsFromGroups)
            .includes(__classPrivateFieldGet(this, _UsersManagement_configService, "f").approvePermissionsByPermissionsName);
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
    onPermissionsRequested(onPermissionsRequestedFunction) {
        emitter_1.emitter.addListener(users_service_events_1.USERS_SERVICE_EVENTS.USER_PERMISSIONS_REQUESTED, onPermissionsRequestedFunction);
    }
    onPermissionsApproved(onPermissionsApprovedFunction) {
        emitter_1.emitter.addListener(users_service_events_1.USERS_SERVICE_EVENTS.USER_PERMISSIONS_APPROVED, onPermissionsApprovedFunction);
    }
    onForgotPassword(onForgotPasswordFunction) {
        emitter_1.emitter.addListener(users_service_events_1.USERS_SERVICE_EVENTS.RESET_PASSWORD_REQUESTED, onForgotPasswordFunction);
    }
    async innerSignInGoogle(googleEmail) {
        const user = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.findOne({
            email: googleEmail,
        });
        if (!user) {
            throw new HttpError_1.default(error_codes_1.SIGN_IN_ERRORS.USER_NOT_EXIST);
        }
        const { isValid, isDeleted } = user;
        if (isDeleted) {
            throw new HttpError_1.default(error_codes_1.SIGN_IN_ERRORS.USER_DELETED);
        }
        if (!isValid) {
            throw new HttpError_1.default(error_codes_1.SIGN_IN_ERRORS.USER_NOT_VERIFIED);
        }
        const token = this.loginUser({
            user,
            signedInVia: constant_1.USER_SIGNED_UP_OR_IN_BY.GOOGLE,
        });
        return token;
    }
    async innerSignUpGoogle(googleUser) {
        try {
            const defaultPermissionsSignUp = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Permissions.findPermissions({ isBase: true });
            const user = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.createGoogleUser({
                ...googleUser,
                permissions: defaultPermissionsSignUp.map(({ name }) => name),
            });
            const userClean = mapToMinimal(user);
            return userClean;
        }
        catch (error) {
            throw error;
        }
    }
    async signInGoogle(token) {
        try {
            if (!this.googleApis) {
                throw new HttpError_1.default(error_codes_1.MISSING_CONFIGURATION);
            }
            const googleUser = await this.googleApis.verifyClientToken({ token });
            const userExists = await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.findOne({
                email: googleUser.email,
            });
            if (!userExists) {
                const { email, firstName, lastName, userVerified } = googleUser;
                const userAfterSignedUpViaGoogleResponse = await this.innerSignUpGoogle({
                    email,
                    firstName,
                    lastName,
                    isValid: userVerified,
                    isDeleted: false,
                    signedUpVia: constant_1.USER_SIGNED_UP_OR_IN_BY.GOOGLE,
                    extendedInfo: { googleUser },
                    avatarUrl: googleUser.avatarUrl,
                });
                emitter_1.emitter.emit(users_service_events_1.USERS_SERVICE_EVENTS.USER_SIGN_UP_VIA_GOOGLE, userAfterSignedUpViaGoogleResponse);
            }
            else {
                await __classPrivateFieldGet(this, _UsersManagement_services, "f").Users.updateUser({ id: userExists.id }, {
                    extendedInfo: { googleUser },
                    avatarUrl: userExists.avatarUrl
                        ? userExists.avatarUrl
                        : googleUser.avatarUrl,
                });
            }
            const tokenResponse = await this.innerSignInGoogle(googleUser.email);
            emitter_1.emitter.emit(users_service_events_1.USERS_SERVICE_EVENTS.USER_SIGN_IN_VIA_GOOGLE, tokenResponse);
            return tokenResponse;
        }
        catch (error) {
            emitter_1.emitter.emit(users_service_events_1.USERS_SERVICE_EVENTS.USER_SIGN_IN_VIA_GOOGLE_ERROR, error);
            throw error;
        }
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