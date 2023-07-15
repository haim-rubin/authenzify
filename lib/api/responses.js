"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGN_UP_SUCCEEDED = void 0;
const httpStatus = require("http-status");
exports.SIGN_UP_SUCCEEDED = {
    httpStatusCode: httpStatus.CREATED,
    code: 'SIGN_UP.USER_CREATED',
    httpResponse: { message: httpStatus[httpStatus.CREATED] },
};
//# sourceMappingURL=responses.js.map