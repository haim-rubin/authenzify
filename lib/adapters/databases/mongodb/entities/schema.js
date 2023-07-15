"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationSchema = exports.UserSchema = void 0;
const mongoose_1 = require("mongoose");
const UserSchemaDef_1 = require("../../../../models/UserSchemaDef");
const VerificationSchemaDef_1 = require("../../../../models/VerificationSchemaDef");
exports.UserSchema = new mongoose_1.Schema(UserSchemaDef_1.UserSchemaDef);
exports.VerificationSchema = new mongoose_1.Schema(VerificationSchemaDef_1.VerificationSchemaDef);
//# sourceMappingURL=schema.js.map