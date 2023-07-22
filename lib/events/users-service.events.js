"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USERS_SERVICE_EVENTS = void 0;
const USERS_SIGN_UP_EVENTS = {
    USER_SIGN_UP: 'USER_SIGN_UP',
    USER_SIGN_UP_ERROR: 'USER_SIGN_UP_ERROR',
};
const USERS_SIGN_IN_EVENTS = {
    USER_SIGN_IN: 'USER_SIGN_IN',
    USER_SIGN_IN_ERROR: 'USER_SIGN_IN_ERROR',
};
const PERMISSIONS_EVENTS = {
    USER_PERMISSIONS_REQUESTED: 'USER_PERMISSIONS_REQUESTED',
};
exports.USERS_SERVICE_EVENTS = {
    ...USERS_SIGN_UP_EVENTS,
    ...USERS_SIGN_IN_EVENTS,
    ...PERMISSIONS_EVENTS,
};
//# sourceMappingURL=users-service.events.js.map