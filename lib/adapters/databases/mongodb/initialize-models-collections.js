"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModelsCollections = void 0;
const initModelsCollections = ({ connection, modelsInfo, }) => {
    const models = modelsInfo.reduce((models, { modelInfo, collectionInfo: { name, alias } }) => {
        const { key, schema } = modelInfo;
        const model = connection.model(key, schema);
        const collection = connection.collection(name);
        return {
            ...models,
            [key]: model,
            [alias]: collection,
            connection,
        };
    }, {});
    return models;
};
exports.initModelsCollections = initModelsCollections;
//# sourceMappingURL=initialize-models-collections.js.map