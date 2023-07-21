"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGroupSchemaDef = void 0;
exports.PermissionsGroupSchemaDef = {
    id: String,
    tenantId: { type: String, required: true },
    name: { type: String, required: true },
    isDeleted: Boolean,
    permissions: Array,
};
//# sourceMappingURL=PermissionsGroupSchemaDef.js.map