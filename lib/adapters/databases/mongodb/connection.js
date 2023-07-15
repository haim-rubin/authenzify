"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = void 0;
const mongoose_1 = require("mongoose");
const connect = async (config) => {
    const connection = mongoose_1.default.createConnection();
    await connection.openUri(config.uri, config.options);
    return connection;
};
exports.connect = connect;
//# sourceMappingURL=connection.js.map