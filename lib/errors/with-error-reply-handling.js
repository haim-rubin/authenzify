"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyOnErrorOnly = exports.withErrorHandlingReply = exports.withErrorHandling = void 0;
const error_codes_1 = require("./error-codes");
const error_util_js_1 = require("./error-util.js");
const HttpError_1 = require("./HttpError");
const withErrorHandling = (log, defaultError) => async (funcToInvoke) => {
    try {
        return await funcToInvoke();
    }
    catch (error) {
        log.error(`[!] [withErrorHandling] - Error: ${(0, error_util_js_1.stringifyError)(error)}`);
        throw HttpError_1.default.isInstanceOf(error) ? error : defaultError;
    }
};
exports.withErrorHandling = withErrorHandling;
const withErrorHandlingReply = ({ reply, log, defaultError = new HttpError_1.default(error_codes_1.GENERAL_ERROR) }) => async (funcToInvoke) => {
    try {
        return await (0, exports.withErrorHandling)(log, defaultError)(funcToInvoke);
    }
    catch (error) {
        const { httpStatusCode, code, httpStatusText } = error;
        reply.status(httpStatusCode).send({ code, httpStatusText });
    }
};
exports.withErrorHandlingReply = withErrorHandlingReply;
const replyOnErrorOnly = ({ reply, log, defaultError = error_codes_1.GENERAL_ERROR }) => async (funcToInvoke) => {
    try {
        return await (0, exports.withErrorHandling)(log, defaultError)(funcToInvoke);
    }
    catch (error) {
        log.error(`[!] [replyOnErrorOnly] Error: ${error?.valueOf()}`);
        const errorMerged = HttpError_1.default.isInstanceOf(error)
            ? error
            : { ...error, ...defaultError };
        reply.status(errorMerged.statusCode).send({ error: errorMerged.exposed });
    }
};
exports.replyOnErrorOnly = replyOnErrorOnly;
//# sourceMappingURL=with-error-reply-handling.js.map