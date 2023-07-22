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
    tenantId: { type: String, default: null },
};
//# sourceMappingURL=UserSchemaDef.js.map