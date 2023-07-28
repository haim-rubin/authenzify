"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initUsersRoutes = void 0;
const with_error_reply_handling_1 = require("../errors/with-error-reply-handling");
const responses_1 = require("../api/responses");
const helpers_1 = require("../util/helpers");
const HttpError_1 = require("../errors/HttpError");
const error_codes_1 = require("../errors/error-codes");
const initUsersRoutes = ({ usersManagement, configService, authenticated, }) => {
    return async (webServer) => {
        await webServer.post('/sign-up', function (request, reply) {
            (0, with_error_reply_handling_1.withErrorHandlingReply)({
                reply,
                log: this.log,
            })(async () => {
                const { body } = request;
                const userDetails = body;
                this.log.info(`Sign up user email: '${userDetails.email}'`);
                const user = await usersManagement.signUp(userDetails);
                this.log.info(`Succeeded to create user: { email: ${user.email}, id: ${user.id} }`);
                reply
                    .status(responses_1.SIGN_UP_SUCCEEDED.httpStatusCode)
                    .send({ ...responses_1.SIGN_UP_SUCCEEDED.httpResponse });
            });
        });
        await webServer.post('/sign-in', function (request, reply) {
            (0, with_error_reply_handling_1.withErrorHandlingReply)({
                reply,
                log: this.log,
            })(async () => {
                const { body } = request;
                const userDetails = body;
                this.log.info(`Sign in user email: '${userDetails.email}'`);
                const token = await usersManagement.signIn(userDetails);
                if (!configService.setCookieOnSignIn) {
                    reply.send({ token });
                    return;
                }
                reply
                    .clearCookie(configService.authorizationCookieKey)
                    .setCookie(configService.authorizationCookieKey, token, {
                    path: '/',
                    signed: false,
                    sameSite: true,
                })
                    .send({ token });
            });
        });
        await webServer.get('/:id', { preHandler: [authenticated] }, function (request, reply) {
            (0, with_error_reply_handling_1.withErrorHandlingReply)({
                reply,
                log: this.log,
            })(async () => {
                const params = request.params;
                const { id } = params;
                this.log.info(`Get user by id: '${id}'`);
                const user = await usersManagement.getUser({ id });
                if (!user) {
                    throw new HttpError_1.default(error_codes_1.SIGN_IN_ERRORS.USER_NOT_EXIST);
                }
                reply.send((0, helpers_1.cleanUser)(user));
            });
        });
        await webServer.get('/me', { preHandler: [authenticated] }, function (request, reply) {
            (0, with_error_reply_handling_1.withErrorHandlingReply)({
                reply,
                log: this.log,
            })(async () => {
                const { id } = request.requestContext.get('userInfo');
                this.log.info(`Get user 'me' by id: '${id}'`);
                const user = await usersManagement.getUser({ id });
                if (!user) {
                    throw new HttpError_1.default(error_codes_1.SIGN_IN_ERRORS.USER_NOT_EXIST);
                }
                reply.send((0, helpers_1.cleanUser)(user));
            });
        });
        await webServer.get('/verify/:id/activation', function (request, reply) {
            (0, with_error_reply_handling_1.withErrorHandlingReply)({
                reply,
                log: this.log,
            })(async () => {
                const params = request.params;
                const { id } = params;
                this.log.info(`Verify user by activation id: '${id}'`);
                const verified = await usersManagement.verifyActivation(id);
                reply.send({ verified });
            });
        });
        await webServer.post('/permissions/:id', { preHandler: [authenticated] }, function (request, reply) {
            (0, with_error_reply_handling_1.withErrorHandlingReply)({
                reply,
                log: this.log,
            })(async () => {
                const { id } = request.params;
                const userInfo = request.requestContext.get('userInfo');
                const { body: companyDetails } = request;
                const emailSent = await usersManagement.requestPermissionForUser({
                    companyDetails,
                    userInfo,
                    id,
                });
                reply.send({ emailSent });
            });
        });
        await webServer.get('/verify/:id/permissions/:role', { preHandler: [authenticated] }, function (request, reply) {
            (0, with_error_reply_handling_1.withErrorHandlingReply)({
                reply,
                log: this.log,
            })(async () => {
                const { id, role } = request.params;
                const userInfo = request.requestContext.get('userInfo');
                const verified = await usersManagement.verifyUserPermissionRequest({
                    verificationId: id,
                    role,
                    userInfo,
                });
                reply.send({ verified });
            });
        });
        await webServer.post('/change-password', { preHandler: [authenticated] }, function (request, reply) {
            (0, with_error_reply_handling_1.withErrorHandlingReply)({
                reply,
                log: this.log,
            })(async () => {
                const userInfo = request.requestContext.get('userInfo');
                const { body: { password, newPassword }, } = request;
                const passwordChanged = await usersManagement.changePassword({
                    password,
                    newPassword,
                    userInfo,
                });
                reply.send({ passwordChanged });
            });
        });
        await webServer.post('/forgot-password', function (request, reply) {
            (0, with_error_reply_handling_1.withErrorHandlingReply)({
                reply,
                log: this.log,
            })(async () => {
                const { body: { email }, log, } = request;
                try {
                    const passwordChanged = await usersManagement.forgotPassword({
                        email,
                    });
                    reply.send({ passwordChanged });
                }
                catch (error) {
                    log.error(error);
                    reply.send({ passwordChanged: true });
                }
            });
        });
        await webServer.post('/verify/:verificationId/apply-forgot-password', function (request, reply) {
            (0, with_error_reply_handling_1.withErrorHandlingReply)({
                reply,
                log: this.log,
            })(async () => {
                const { params, body: { newPassword }, log, } = request;
                const { verificationId } = params;
                try {
                    const passwordChanged = await usersManagement.applyForgotPassword({
                        newPassword,
                        verificationId,
                    });
                    reply.send({ passwordChanged });
                }
                catch (error) {
                    log.error(error);
                    reply.send({ passwordChanged: true });
                }
            });
        });
        await webServer.post('/sign-in-google', function (request, reply) {
            (0, with_error_reply_handling_1.withErrorHandlingReply)({
                reply,
                log: this.log,
            })(async () => {
                const { body } = request;
                this.log.info(`Sign in user email: '${'userDetails.email'}'`);
                const token = await usersManagement.signInGoogle(body);
                if (!configService.setCookieOnSignIn) {
                    reply.send({ token });
                    return;
                }
                reply
                    .clearCookie(configService.authorizationCookieKey)
                    .setCookie(configService.authorizationCookieKey, token, {
                    path: '/',
                    signed: false,
                    sameSite: true,
                })
                    .send({ token });
            });
        });
    };
};
exports.initUsersRoutes = initUsersRoutes;
//# sourceMappingURL=users-routes.js.map