"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePermissionsGroupId = exports.generatePermissionId = exports.generateVerificationId = exports.generateUserId = exports.DATABASE_ID_PREFIX = void 0;
const uuid_1 = require("uuid");
exports.DATABASE_ID_PREFIX = Object.freeze({
    USER: 'usr',
    VERIFICATION: 'vrf',
    PERMISSION: 'prm',
    PERMISSIONS_GROUP: 'role',
});
const generateId = () => {
    return (0, uuid_1.v4)();
};
const generateUserId = () => {
    return `${exports.DATABASE_ID_PREFIX.USER}_${generateId()}`;
};
exports.generateUserId = generateUserId;
const generateVerificationId = () => {
    return `${exports.DATABASE_ID_PREFIX.VERIFICATION}_${generateId()}`;
};
exports.generateVerificationId = generateVerificationId;
const generatePermissionId = () => {
    return `${exports.DATABASE_ID_PREFIX.PERMISSION}_${generateId()}`;
};
exports.generatePermissionId = generatePermissionId;
const generatePermissionsGroupId = () => {
    return `${exports.DATABASE_ID_PREFIX.PERMISSIONS_GROUP}_${generateId()}`;
};
exports.generatePermissionsGroupId = generatePermissionsGroupId;
//# sourceMappingURL=record-id-prefixes.js.map