"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.factory = void 0;
const mongodb_1 = require("./mongodb");
const users_service_1 = require("../../services/users.service");
const verifications_service_1 = require("../../services/verifications.service");
const users_management_1 = require("../business-logic/users-management");
const SUPPORTED_STORAGES = {
    mongodb: true,
};
const factory = async (configService) => {
    if (!SUPPORTED_STORAGES[configService.storage.type]) {
        throw new Error(`${configService.storage.type} storage not supported yet`);
    }
    const { iDalUsersService, iDalVerificationsService } = await (0, mongodb_1.initMongoDalServices)({
        config: configService.storage,
    });
    const Users = new users_service_1.UsersService(configService, iDalUsersService);
    const Verifications = new verifications_service_1.VerificationsService(configService, iDalVerificationsService);
    const services = {
        Users,
        Verifications,
    };
    return (0, users_management_1.initUsersManagement)({ services, configService });
};
exports.factory = factory;
//# sourceMappingURL=index.js.map