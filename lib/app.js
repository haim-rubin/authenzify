"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = void 0;
const fastify_1 = require("fastify");
const request_context_1 = require("@fastify/request-context");
const factories_1 = require("./adapters/factories");
const config_service_1 = require("./services/config.service");
const cookie_1 = require("@fastify/cookie");
const interceptors_1 = require("./interceptors");
const users_routes_1 = require("./app-routes/users-routes");
const usersService = async (config) => {
    const configService = new config_service_1.ConfigService(config);
    const usersManagement = await (0, factories_1.factory)(configService);
    const webServer = (0, fastify_1.default)({ logger: configService.logger });
    await webServer.register(cookie_1.default);
    await webServer.register(request_context_1.fastifyRequestContext, {
        defaultStoreValues: {
            userInfo: { id: 'system' },
        },
    });
    const { authenticated } = (0, interceptors_1.getAuthenticatedInterceptor)(config);
    webServer.register((0, users_routes_1.initUsersRoutes)({ usersManagement, configService, authenticated }), { prefix: configService.usersRoutesPrefix });
    webServer.listen({ port: configService.port, host: configService.host }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
    return {
        server: webServer,
        usersManagement,
    };
};
exports.usersService = usersService;
//# sourceMappingURL=app.js.map