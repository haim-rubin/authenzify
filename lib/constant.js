"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_SIGNED_UP_OR_IN_BY = exports.ACTIVATE_USER_BY = exports.EmailProvider = exports.VERIFICATION_TYPES = void 0;
exports.VERIFICATION_TYPES = Object.freeze({
    SIGN_UP: 'SIGN_UP',
    RESET_PASSWORD_REQUEST: 'RESET_PASSWORD_REQUEST',
    USER_PERMISSIONS_REQUEST: 'USER_PERMISSIONS_REQUEST',
    DID_NOT_REQUESTED_TO_RESET_PASSWORD: 'DID_NOT_REQUESTED_TO_RESET_PASSWORD',
});
exports.EmailProvider = {
    NODEMAILER: 'nodemailer',
};
exports.ACTIVATE_USER_BY = {
    AUTO: 'AUTO',
    USER_EMAIL: 'USER_EMAIL',
    ADMIN_EMAIL: 'ADMIN_EMAIL',
    CODE: 'CODE',
};
exports.USER_SIGNED_UP_OR_IN_BY = Object.freeze({
    EMAIL: 'EMAIL',
    GOOGLE: 'GOOGLE',
    SYSTEM: 'SYSTEM',
});
//# sourceMappingURL=constant.js.map