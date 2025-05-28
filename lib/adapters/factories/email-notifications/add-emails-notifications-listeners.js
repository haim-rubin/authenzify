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
                    signInRoute: configService.signInRoute,
                    resetPasswordRoute: configService.resetPasswordRoute,
                    didNotAskedToResetPasswordRoute: configService.didNotAskedToResetPasswordRoute,
                });
                return nodemailerProvider;
        }
        return null;
    }
};
exports.getEmailNotificationsProvider = getEmailNotificationsProvider;
const addEmailsNotificationsListeners = async ({ configService, usersManagement, }) => {
    const emailNotifications = await (0, exports.getEmailNotificationsProvider)(configService);
    if (emailNotifications) {
        if (configService.activateUserByEmail ||
            configService.activateUserByAdmin) {
            usersManagement.onSignUp(async (user) => {
                try {
                    const { id } = user;
                    const verification = await usersManagement.createVerification({
                        userId: id,
                        type: constant_1.VERIFICATION_TYPES.SIGN_UP,
                    });
                    await emailNotifications.sendActivationMail(user, verification);
                }
                catch (error) {
                    console.error('Failed to send sign up request email');
                    console.error(error);
                }
            });
        }
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
        usersManagement.onPermissionsApproved(async ({ user, adminUser }) => {
            try {
                await emailNotifications.sendPermissionsApprovedMailToUser({
                    user,
                    adminUser,
                });
            }
            catch (error) {
                console.error('Failed to send permissions request email');
                console.error(error);
            }
        });
        usersManagement.onForgotPassword(async ({ user, verification, notRequestedVerification }) => {
            try {
                await emailNotifications.sendResetPasswordMailToUser({
                    user,
                    verification,
                    notRequestedVerification,
                });
            }
            catch (error) {
                console.error('Failed to send reset password request email');
                console.error(error);
            }
        });
    }
};
exports.addEmailsNotificationsListeners = addEmailsNotificationsListeners;
//# sourceMappingURL=add-emails-notifications-listeners.js.map