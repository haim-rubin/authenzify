"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unauthorizedError = void 0;
const error_codes_1 = require("./error-codes");
const HttpError_1 = require("./HttpError");
exports.unauthorizedError = new HttpError_1.default(error_codes_1.UNAUTHORIZED_ERROR);
//# sourceMappingURL=common-http-error.js.map