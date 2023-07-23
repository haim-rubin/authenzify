"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSIONS_ERRORS = exports.SIGN_IN_ERRORS = exports.SIGN_UP_ERRORS = exports.UNAUTHORIZED_ERROR = exports.GENERAL_ERROR = void 0;
const httpStatus = require("http-status");
exports.GENERAL_ERROR = {
    httpStatusCode: httpStatus.INTERNAL_SERVER_ERROR,
    code: `GENERAL.${httpStatus[httpStatus.INTERNAL_SERVER_ERROR]}`,
    httpStatusText: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
};
exports.UNAUTHORIZED_ERROR = {
    httpStatusCode: httpStatus.UNAUTHORIZED,
    code: `GENERAL.${httpStatus[httpStatus.UNAUTHORIZED]}`,
    httpStatusText: httpStatus[httpStatus.UNAUTHORIZED],
};
exports.SIGN_UP_ERRORS = {
    UNKNOWN_ERROR: {
        httpStatusCode: httpStatus.INTERNAL_SERVER_ERROR,
        code: 'SIGN_UP.UNKNOWN_ERROR',
        httpStatusText: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
    },
    INVALID_USERNAME_POLICY: {
        httpStatusCode: httpStatus.BAD_REQUEST,
        code: 'SIGN_UP.INVALID_USERNAME_POLICY',
        httpStatusText: httpStatus[httpStatus.BAD_REQUEST],
    },
    INVALID_PASSWORD_POLICY: {
        httpStatusCode: httpStatus.BAD_REQUEST,
        code: 'SIGN_UP.INVALID_PASSWORD_POLICY',
        httpStatusText: httpStatus[httpStatus.BAD_REQUEST],
    },
    USER_ALREADY_EXISTS: {
        httpStatusCode: httpStatus.CONFLICT,
        code: 'SIGN_UP.USER_ALREADY_EXISTS',
        httpStatusText: httpStatus[httpStatus.CONFLICT],
    },
    INVALID_ACTION: {
        httpStatusCode: httpStatus.FORBIDDEN,
        code: 'SIGN_UP.INVALID_ACTION',
        httpStatusText: httpStatus[httpStatus.FORBIDDEN],
    },
    VERIFICATION_DELETED: {
        httpStatusCode: httpStatus.FORBIDDEN,
        code: 'SIGN_UP.VERIFICATION_DELETED',
        httpStatusText: httpStatus[httpStatus.FORBIDDEN],
    },
    USER_DELETED: {
        httpStatusCode: httpStatus.FORBIDDEN,
        code: 'SIGN_UP.USER_DELETED',
        httpStatusText: httpStatus[httpStatus.FORBIDDEN],
    },
    USER_DOES_NOT_EXISTS: {
        httpStatusCode: httpStatus.FORBIDDEN,
        code: 'SIGN_UP.USER_DOES_NOT_EXISTS',
        httpStatusText: httpStatus[httpStatus.FORBIDDEN],
    },
};
exports.SIGN_IN_ERRORS = {
    INVALID_USERNAME_OR_PASSWORD: {
        httpStatusCode: httpStatus.FORBIDDEN,
        code: 'SIGN_IN.INVALID_USERNAME_OR_PASSWORD',
        httpStatusText: httpStatus[httpStatus.FORBIDDEN],
    },
    USER_NOT_VERIFIED: {
        httpStatusCode: httpStatus.FORBIDDEN,
        code: 'SIGN_IN.USER_NOT_VERIFIED',
        httpStatusText: httpStatus[httpStatus.FORBIDDEN],
    },
    USER_NOT_EXIST: {
        httpStatusCode: httpStatus.FORBIDDEN,
        code: 'SIGN_IN.USER_NOT_EXIST',
        httpStatusText: httpStatus[httpStatus.FORBIDDEN],
    },
    USER_DELETED: {
        httpStatusCode: httpStatus.FORBIDDEN,
        code: 'SIGN_IN.USER_DELETED',
        httpStatusText: httpStatus[httpStatus.FORBIDDEN],
    },
};
exports.PERMISSIONS_ERRORS = {
    PERMISSION_CANNOT_INITIATE_BY_OTHER_USER: {
        httpStatusCode: httpStatus.FORBIDDEN,
        code: 'PERMISSIONS.PERMISSION_CANNOT_INITIATE_BY_OTHER_USER',
        httpStatusText: httpStatus[httpStatus.FORBIDDEN],
    },
    INVALID_INITIATOR_EMAIL: {
        httpStatusCode: httpStatus.FORBIDDEN,
        code: 'PERMISSIONS.INVALID_INITIATOR_EMAIL',
        httpStatusText: httpStatus[httpStatus.FORBIDDEN],
    },
};
//# sourceMappingURL=error-codes.js.map