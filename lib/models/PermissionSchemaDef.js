"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionSchemaDef = void 0;
exports.PermissionSchemaDef = {
    id: String,
    name: { type: String, unique: true, required: true },
    description: String,
    isDeleted: { type: Boolean, default: false },
};
//# sourceMappingURL=PermissionSchemaDef.js.map