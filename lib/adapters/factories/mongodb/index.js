"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMongoDalServices = exports.initMongoDb = void 0;
const schema_1 = require("../../databases/mongodb/entities/schema");
const initialize_models_collections_1 = require("../../databases/mongodb/initialize-models-collections");
const connection_1 = require("../../databases/mongodb/connection");
const MongoUsersService_1 = require("./MongoUsersService");
const VerificationsService_1 = require("./VerificationsService");
const MongoPermissionsService_1 = require("./MongoPermissionsService");
const initMongoDb = async ({ config, }) => {
    const connection = await (0, connection_1.connect)(config);
    const modelsCollections = (0, initialize_models_collections_1.initModelsCollections)({
        connection,
        modelsInfo: [
            {
                modelInfo: { key: 'User', schema: schema_1.UserSchema },
                collectionInfo: { name: 'user', alias: 'users' },
            },
            {
                modelInfo: { key: 'Verification', schema: schema_1.VerificationSchema },
                collectionInfo: { name: 'verification', alias: 'verifications' },
            },
            {
                modelInfo: { key: 'Permission', schema: schema_1.PermissionSchema },
                collectionInfo: { name: 'permission', alias: 'permissions' },
            },
            {
                modelInfo: { key: 'PermissionsGroup', schema: schema_1.PermissionsGroupSchema },
                collectionInfo: { name: 'permission', alias: 'permissions' },
            },
        ],
    });
    return modelsCollections;
};
exports.initMongoDb = initMongoDb;
const initMongoDalServices = async ({ config, }) => {
    const modelsCollections = await (0, exports.initMongoDb)({ config });
    const iDalUsersService = new MongoUsersService_1.MongoUsersService(modelsCollections);
    const iDalVerificationsService = new VerificationsService_1.MongoVerificationsService(modelsCollections);
    const iDalPermissionsService = new MongoPermissionsService_1.MongoPermissionsService(modelsCollections);
    return { iDalUsersService, iDalVerificationsService, iDalPermissionsService };
};
exports.initMongoDalServices = initMongoDalServices;
//# sourceMappingURL=index.js.map