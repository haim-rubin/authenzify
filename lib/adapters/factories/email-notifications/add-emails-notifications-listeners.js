"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEmailsNotificationsListeners = exports.getEmailNotificationsProvider = void 0;
const EmailTemplates_1 = require("../../notifications/emails/EmailTemplates");
const NodemailerEmailNotifications_1 = require("../../notifications/emails/nodemailer/NodemailerEmailNotifications");
const constant_1 = require("../../../constant");
const getEmailNotificationsProvider = async (configService) => {
    if (configService.emailProvider) {
        switch (configService.emailProvider.provider) {
            case constant_1.EmailProvider.NODEMAILER:
                const emailTemplates = await (0, EmailTemplates_1.loadEmailTemplates)(configService.emailProvider.emailTemplates);
                const nodemailerProvider = new NodemailerEmailNotifications_1.NodemailerEmailNotifications(emailTemplates, configService.emailProvider.settings, {
                    clientDomain: configService.clientDomain,
                    domain: configService.domain,
                    applicationName: configService.applicationName,
                    activationVerificationRoute: configService.activationVerificationRoute,
                    permissionsVerificationRoute: configService.permissionsVerificationRoute,
                });
                return nodemailerProvider;
        }
        return null;
    }
};
exports.getEmailNotificationsProvider = getEmailNotificationsProvider;
const addEmailsNotificationsListeners = async ({ configService, usersManagement, }) => {
    const emailNotifications = await (0, exports.getEmailNotificationsProvider)(configService);
    if (emailNotifications &&
        (configService.activateUserByEmail || configService.activateUserByAdmin)) {
        usersManagement.onSignUp(async (user) => {
            const { id } = user;
            const verification = await usersManagement.createVerification({
                userId: id,
                type: constant_1.VERIFICATION_TYPES.SIGN_UP,
            });
            await emailNotifications.sendActivationMail(user, verification);
        });
        usersManagement.onPermissionsRequested(async ({ permissionsGroups, verification, user, adminEmail }) => {
            try {
                const groupsNames = permissionsGroups.map(({ name }) => name);
                await emailNotifications.sendPermissionsRequestMailToAdmin({
                    groupsNames,
                    verification,
                    user,
                    adminEmail,
                });
            }
            catch (error) {
                console.error('Failed to send permissions request email');
                console.error(error);
            }
        });
    }
};
exports.addEmailsNotificationsListeners = addEmailsNotificationsListeners;
//# sourceMappingURL=add-emails-notifications-listeners.js.map