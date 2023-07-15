"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyError = exports.enumerateError = void 0;
const enumerateError = (originError) => {
    originError.toJSON = function () {
        const objectKeys = Object.getOwnPropertyNames(this);
        const allProps = objectKeys.reduce((props, key) => ({
            ...props,
            [key]: this[key],
        }), {});
        return allProps;
    };
    return originError;
};
exports.enumerateError = enumerateError;
const stringifyError = (error) => {
    return JSON.stringify((0, exports.enumerateError)(error));
};
exports.stringifyError = stringifyError;
//# sourceMappingURL=error-util.js.map