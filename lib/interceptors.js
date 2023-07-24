"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthenticatedInterceptor = void 0;
const common_http_error_1 = require("./errors/common-http-error");
const with_error_reply_handling_1 = require("./errors/with-error-reply-handling");
const verify_token_1 = require("./util/verify-token");
const getAuthenticatedInterceptor = ({ publicKey, jwtOptions, authorizationCookieKey, defaultError = common_http_error_1.unauthorizedError, }) => {
    const { verifyToken } = (0, verify_token_1.initVerifyToken)({ publicKey, jwtOptions });
    return {
        authenticated(request, reply, next) {
            const { [authorizationCookieKey]: Authorization } = request.cookies;
            (0, with_error_reply_handling_1.withErrorHandlingReply)({
                reply,
                log: this.log,
                defaultError,
            })(() => {
                if (!Authorization) {
                    throw new Error(`'${authorizationCookieKey}' is ${Authorization}`);
                }
                const userInfo = verifyToken(Authorization);
                if (!userInfo) {
                    throw new Error(`User token '${Authorization}' not verified`);
                }
                request.requestContext.set('userInfo', userInfo);
                next();
            });
        },
    };
};
exports.getAuthenticatedInterceptor = getAuthenticatedInterceptor;
//# sourceMappingURL=interceptors.js.map