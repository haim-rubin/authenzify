"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchemaDef = void 0;
exports.UserSchemaDef = {
    id: String,
    email: String,
    firstName: String,
    lastName: String,
    username: String,
    isValid: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    password: String,
    salt: String,
    permissions: (Array),
    permissionsGroups: (Array),
    tenantId: { type: String, default: null },
    doesIsCompanyInitializedUser: { type: Boolean, default: false },
    extendedInfo: Object,
    lastLogin: Number,
    signedInVia: String,
    signedUpVia: String,
    avatarUrl: { type: String, default: null },
};
//# sourceMappingURL=UserSchemaDef.js.map