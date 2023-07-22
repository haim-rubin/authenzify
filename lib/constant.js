"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTIVATE_USER_BY = exports.EmailProvider = exports.VERIFICATION_TYPES = void 0;
exports.VERIFICATION_TYPES = Object.freeze({
    SIGN_UP: 'SIGN_UP',
    FORGOT_PASSWORD: 'FORGOT_PASSWORD',
    PERMISSIONS: 'PERMISSIONS',
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
//# sourceMappingURL=constant.js.map