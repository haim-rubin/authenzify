"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpStatus = require("http-status");
const DEFAULT_ERROR = {
    httpStatusCode: httpStatus.INTERNAL_SERVER_ERROR,
    code: 'UNKNOWN',
    httpStatusText: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
};
class HttpError extends Error {
    constructor({ httpStatusCode, code, httpStatusText } = DEFAULT_ERROR) {
        super(`${code || httpStatus[httpStatusCode]}`);
        this.httpStatusCode = httpStatusCode;
        this.code = code;
        this.httpStatusText = httpStatusText;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    static isInstanceOf(instance) {
        return instance instanceof HttpError;
    }
}
exports.default = HttpError;
//# sourceMappingURL=HttpError.js.map