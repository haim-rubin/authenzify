"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGroupSchema = exports.PermissionSchema = exports.VerificationSchema = exports.UserSchema = void 0;
const mongoose_1 = require("mongoose");
const UserSchemaDef_1 = require("../../../../models/UserSchemaDef");
const VerificationSchemaDef_1 = require("../../../../models/VerificationSchemaDef");
const PermissionSchemaDef_1 = require("../../../../models/PermissionSchemaDef");
const PermissionsGroupSchemaDef_1 = require("../../../../models/PermissionsGroupSchemaDef");
exports.UserSchema = new mongoose_1.Schema(UserSchemaDef_1.UserSchemaDef);
exports.VerificationSchema = new mongoose_1.Schema(VerificationSchemaDef_1.VerificationSchemaDef);
exports.PermissionSchema = new mongoose_1.Schema(PermissionSchemaDef_1.PermissionSchemaDef);
exports.PermissionsGroupSchema = new mongoose_1.Schema(PermissionsGroupSchemaDef_1.PermissionsGroupSchemaDef);
exports.PermissionsGroupSchema.index({
    tenantId: 1,
    name: 1,
}, { unique: true });
//# sourceMappingURL=schema.js.map