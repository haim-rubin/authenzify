"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesPasswordMatch = exports.encrypt = exports.getSaltHex = exports.getSalt = void 0;
const crypto_1 = require("crypto");
const util_1 = require("util");
const scryptPromisify = (0, util_1.promisify)(crypto_1.scrypt);
const keyLength = 64;
const baseFormat = 'hex';
const getSalt = (length) => {
    return (0, crypto_1.randomBytes)(length);
};
exports.getSalt = getSalt;
const getSaltHex = (length) => {
    return (0, exports.getSalt)(length).toString(baseFormat);
};
exports.getSaltHex = getSaltHex;
const getEncryptedBuffer = async ({ expression, salt, }) => {
    const encryptedExpression = (await scryptPromisify(expression, salt, keyLength));
    return encryptedExpression;
};
const encrypt = async ({ expression, salt, passwordPrivateKey, }) => {
    const encryptedExpression = await getEncryptedBuffer({
        expression,
        salt: `${salt}${passwordPrivateKey ? passwordPrivateKey : ''}`,
    });
    return encryptedExpression.toString(baseFormat);
};
exports.encrypt = encrypt;
const doesPasswordMatch = async ({ password, encryptedPassword, salt, passwordPrivateKey, }) => {
    const encryptedCurrentPassword = await getEncryptedBuffer({
        expression: password,
        salt: `${salt}${passwordPrivateKey ? passwordPrivateKey : ''}`,
    });
    const isMatch = encryptedCurrentPassword.equals(Buffer.from(encryptedPassword, baseFormat));
    return isMatch;
};
exports.doesPasswordMatch = doesPasswordMatch;
//# sourceMappingURL=encryption.js.map