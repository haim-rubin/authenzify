"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unique = exports.cleanUser = void 0;
const cleanUser = (user) => {
    const { isDeleted, isValid, ...userClean } = user;
    return userClean;
};
exports.cleanUser = cleanUser;
const unique = (item, index, array) => array.indexOf(item) === index;
exports.unique = unique;
//# sourceMappingURL=helpers.js.map