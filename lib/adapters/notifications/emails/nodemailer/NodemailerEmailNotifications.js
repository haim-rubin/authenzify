"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _NodemailerEmailNotifications_instances, _NodemailerEmailNotifications_innerSendMail, _NodemailerEmailNotifications_templatesRender, _NodemailerEmailNotifications_iNodemailerEmailSettings, _NodemailerEmailNotifications_constantParams, _NodemailerEmailNotifications_prepareAndSendEmail;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodemailerEmailNotifications = void 0;
const nodemailer_1 = require("../email-providers/nodemailer");
class NodemailerEmailNotifications {
    constructor(templates, iNodemailerEmailSettings, constantParams) {
        _NodemailerEmailNotifications_instances.add(this);
        _NodemailerEmailNotifications_innerSendMail.set(this, void 0);
        _NodemailerEmailNotifications_templatesRender.set(this, void 0);
        _NodemailerEmailNotifications_iNodemailerEmailSettings.set(this, void 0);
        _NodemailerEmailNotifications_constantParams.set(this, void 0);
        __classPrivateFieldSet(this, _NodemailerEmailNotifications_templatesRender, templates, "f");
        __classPrivateFieldSet(this, _NodemailerEmailNotifications_iNodemailerEmailSettings, iNodemailerEmailSettings, "f");
        __classPrivateFieldSet(this, _NodemailerEmailNotifications_constantParams, constantParams, "f");
        __classPrivateFieldSet(this, _NodemailerEmailNotifications_innerSendMail, (0, nodemailer_1.initNodemailer)(iNodemailerEmailSettings).sendMail, "f");
    }
    async sendMail(emailInfo) {
        try {
            const emailResponse = await __classPrivateFieldGet(this, _NodemailerEmailNotifications_innerSendMail, "f").call(this, emailInfo);
            return emailResponse;
        }
        catch (error) {
            throw error;
        }
    }
    async sendActivationMail(user, verification) {
        try {
            const templates = __classPrivateFieldGet(this, _NodemailerEmailNotifications_templatesRender, "f").renderActivation({
                from: {
                    from: __classPrivateFieldGet(this, _NodemailerEmailNotifications_iNodemailerEmailSettings, "f").from,
                    applicationName: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").applicationName,
                },
                subject: {
                    applicationName: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").applicationName,
                    email: user.email,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                },
                html: {
                    activationLink: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").activationVerificationRoute.replace(new RegExp(':id', 'g'), verification.id),
                },
            });
            return __classPrivateFieldGet(this, _NodemailerEmailNotifications_instances, "m", _NodemailerEmailNotifications_prepareAndSendEmail).call(this, templates, user.email);
        }
        catch (error) {
            throw error;
        }
    }
    sendVerificationMail(user, verification) {
        try {
            const templates = __classPrivateFieldGet(this, _NodemailerEmailNotifications_templatesRender, "f").renderVerification({
                from: __classPrivateFieldGet(this, _NodemailerEmailNotifications_iNodemailerEmailSettings, "f").from,
                subject: {
                    applicationName: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").applicationName,
                    email: user.email,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                },
                html: {
                    activationLink: `${__classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").domain}/verify/${verification.id}`,
                },
            });
            return __classPrivateFieldGet(this, _NodemailerEmailNotifications_instances, "m", _NodemailerEmailNotifications_prepareAndSendEmail).call(this, templates, user.email);
        }
        catch (error) {
            throw error;
        }
    }
    sendForgotPasswordMail(user, verification) {
        try {
            const templates = __classPrivateFieldGet(this, _NodemailerEmailNotifications_templatesRender, "f").renderForgotPassword({
                from: __classPrivateFieldGet(this, _NodemailerEmailNotifications_iNodemailerEmailSettings, "f").from,
                subject: {
                    applicationName: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").applicationName,
                    email: user.email,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                },
                html: {
                    loginUrl: `/${verification.id}`,
                },
            });
            return __classPrivateFieldGet(this, _NodemailerEmailNotifications_instances, "m", _NodemailerEmailNotifications_prepareAndSendEmail).call(this, templates, user.email);
        }
        catch (error) {
            throw error;
        }
    }
    sendPermissionsRequestMailToAdmin({ groupsNames, verification, user, adminEmail, }) {
        const templates = __classPrivateFieldGet(this, _NodemailerEmailNotifications_templatesRender, "f").renderPermissionsRequest({
            from: {
                from: __classPrivateFieldGet(this, _NodemailerEmailNotifications_iNodemailerEmailSettings, "f").from,
                applicationName: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").applicationName,
            },
            subject: {
                applicationName: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").applicationName,
                email: user.email,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
            },
            html: {
                email: user.email,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                permissions: groupsNames.map((name) => {
                    return {
                        name,
                        link: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").permissionsVerificationRoute
                            .replace(new RegExp(':id', 'g'), verification.id)
                            .replace(new RegExp(':role', 'g'), name),
                    };
                }),
            },
        });
        return __classPrivateFieldGet(this, _NodemailerEmailNotifications_instances, "m", _NodemailerEmailNotifications_prepareAndSendEmail).call(this, templates, adminEmail);
    }
    sendPermissionsApprovedMailToUser({ user, adminUser }) {
        const templates = __classPrivateFieldGet(this, _NodemailerEmailNotifications_templatesRender, "f").renderPermissionsApprovedToUser({
            from: {
                from: __classPrivateFieldGet(this, _NodemailerEmailNotifications_iNodemailerEmailSettings, "f").from,
                applicationName: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").applicationName,
            },
            subject: {
                applicationName: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").applicationName,
                email: adminUser.email,
                firstName: adminUser.firstName || '',
                lastName: adminUser.lastName || '',
            },
            html: {
                email: adminUser.email,
                firstName: adminUser.firstName || '',
                lastName: adminUser.lastName || '',
                applicationName: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").applicationName,
                signInRoute: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").signInRoute,
            },
        });
        return __classPrivateFieldGet(this, _NodemailerEmailNotifications_instances, "m", _NodemailerEmailNotifications_prepareAndSendEmail).call(this, templates, user.email);
    }
    sendResetPasswordMailToUser({ user, verification, notRequestedVerification, }) {
        const templates = __classPrivateFieldGet(this, _NodemailerEmailNotifications_templatesRender, "f").renderResetPasswordRequested({
            from: {
                from: __classPrivateFieldGet(this, _NodemailerEmailNotifications_iNodemailerEmailSettings, "f").from,
                applicationName: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").applicationName,
            },
            subject: {
                applicationName: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").applicationName,
                email: user.email,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
            },
            html: {
                email: user.email,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                applicationName: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").applicationName,
                resetPasswordRoute: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").resetPasswordRoute.replace(new RegExp(':id', 'g'), verification.id),
                didNotAskedToResetPasswordRoute: __classPrivateFieldGet(this, _NodemailerEmailNotifications_constantParams, "f").didNotAskedToResetPasswordRoute.replace(new RegExp(':id', 'g'), notRequestedVerification.id),
            },
        });
        return __classPrivateFieldGet(this, _NodemailerEmailNotifications_instances, "m", _NodemailerEmailNotifications_prepareAndSendEmail).call(this, templates, user.email);
    }
}
exports.NodemailerEmailNotifications = NodemailerEmailNotifications;
_NodemailerEmailNotifications_innerSendMail = new WeakMap(), _NodemailerEmailNotifications_templatesRender = new WeakMap(), _NodemailerEmailNotifications_iNodemailerEmailSettings = new WeakMap(), _NodemailerEmailNotifications_constantParams = new WeakMap(), _NodemailerEmailNotifications_instances = new WeakSet(), _NodemailerEmailNotifications_prepareAndSendEmail = async function _NodemailerEmailNotifications_prepareAndSendEmail(template, to) {
    try {
        const emailInfo = {
            ...template,
            to,
        };
        const emailResponse = this.sendMail(emailInfo);
        return emailResponse;
    }
    catch (error) {
        throw error;
    }
};
//# sourceMappingURL=NodemailerEmailNotifications.js.map