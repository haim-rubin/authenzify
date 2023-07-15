"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initVerifyToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const initVerifyToken = ({ publicKey, jwtOptions }) => {
    const jwtVerifyOptions = {
        ...jwtOptions,
        algorithm: [jwtOptions.algorithm],
    };
    return {
        verifyToken(token) {
            const decoded = (0, jsonwebtoken_1.verify)(token, publicKey, jwtVerifyOptions);
            return decoded;
        },
    };
};
exports.initVerifyToken = initVerifyToken;
//# sourceMappingURL=verify-token.js.map