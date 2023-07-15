"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUser = void 0;
const cleanUser = (user) => {
    const { isDeleted, isValid, ...userClean } = user;
    return userClean;
};
exports.cleanUser = cleanUser;
//# sourceMappingURL=helpers.js.map