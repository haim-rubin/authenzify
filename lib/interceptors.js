"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthenticatedInterceptor = void 0;
const verify_token_1 = require("./util/verify-token");
const getAuthenticatedInterceptor = ({ publicKey, jwtOptions, authorizationCookieKey, }) => {
    const { verifyToken } = (0, verify_token_1.initVerifyToken)({ publicKey, jwtOptions });
    return {
        tryToExtractUserAuthenticated(request) {
            const { [authorizationCookieKey]: Authorization } = request.cookies;
            if (!Authorization) {
                throw new Error(`'${authorizationCookieKey}' is ${Authorization}`);
            }
            const userInfo = verifyToken(Authorization);
            if (!userInfo) {
                throw new Error(`User token '${Authorization}' not verified`);
            }
            return userInfo;
        },
    };
};
exports.getAuthenticatedInterceptor = getAuthenticatedInterceptor;
//# sourceMappingURL=interceptors.js.map