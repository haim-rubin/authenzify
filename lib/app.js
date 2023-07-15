"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = void 0;
const fastify_1 = require("fastify");
const request_context_1 = require("@fastify/request-context");
const factories_1 = require("./adapters/factories");
const config_service_1 = require("./services/config.service");
const cookie_1 = require("@fastify/cookie");
const with_error_reply_handling_1 = require("./errors/with-error-reply-handling");
const responses_1 = require("./api/responses");
const interceptors_1 = require("./interceptors");
const helpers_1 = require("./util/helpers");
const usersService = async (config) => {
    const configService = new config_service_1.ConfigService(config);
    const usersManagement = await (0, factories_1.factory)(configService);
    const server = (0, fastify_1.default)({ logger: true });
    await server.register(cookie_1.default);
    await server.register(request_context_1.fastifyRequestContext, {
        defaultStoreValues: {
            userInfo: { id: 'system' },
        },
    });
    const { authenticated } = (0, interceptors_1.getAuthenticatedInterceptor)(config);
    server.post('/users/sign-up', function (request, reply) {
        (0, with_error_reply_handling_1.withErrorHandlingReply)({
            reply,
            log: this.log,
        })(async () => {
            const { body } = request;
            const userDetails = body;
            this.log.info(`Sign up user email: '${userDetails.email}'`);
            const user = await usersManagement.signUp(userDetails);
            reply
                .status(responses_1.SIGN_UP_SUCCEEDED.httpStatusCode)
                .send({ ...responses_1.SIGN_UP_SUCCEEDED.httpResponse });
        });
    });
    server.post('/users/sign-in', function (request, reply) {
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
    server.get('/users/:id', { preHandler: [authenticated] }, function (request, reply) {
        (0, with_error_reply_handling_1.withErrorHandlingReply)({
            reply,
            log: this.log,
        })(async () => {
            const params = request.params;
            const { id } = params;
            this.log.info(`Get user by id: '${id}'`);
            const user = await usersManagement.getUser({ id });
            reply.send((0, helpers_1.cleanUser)(user));
        });
    });
    server.get('/users/me', { preHandler: [authenticated] }, function (request, reply) {
        (0, with_error_reply_handling_1.withErrorHandlingReply)({
            reply,
            log: this.log,
        })(async () => {
            const { id } = request.requestContext.get('userInfo');
            this.log.info(`Get user 'me' by id: '${id}'`);
            const user = await usersManagement.getUser({ id });
            reply.send((0, helpers_1.cleanUser)(user));
        });
    });
    server.get('/users/verify/:id/activation', function (request, reply) {
        (0, with_error_reply_handling_1.withErrorHandlingReply)({
            reply,
            log: this.log,
        })(async () => {
            const params = request.params;
            const { id } = params;
            this.log.info(`Verify user by activation id: '${id}'`);
            const verified = await usersManagement.verifyActivation(id);
            reply.send(verified);
        });
    });
    server.listen({ port: config.port || 9090, host: config.host || '0.0.0.0' }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
    return {
        server,
        usersManagement,
    };
};
exports.usersService = usersService;
//# sourceMappingURL=app.js.map