"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapMongoDbId = void 0;
const mapMongoDbId = (mongodbObject) => {
    if (!mongodbObject || typeof mongodbObject !== 'object') {
        return null;
    }
    return {
        ...mongodbObject,
        id: mongodbObject._id.toString(),
    };
};
exports.mapMongoDbId = mapMongoDbId;
//# sourceMappingURL=mongodb-util.js.map