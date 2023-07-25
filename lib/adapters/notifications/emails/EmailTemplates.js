"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEmailTemplates = exports.getTemplatesContentOrReadFile = exports.getTemplateContentOrReadFile = void 0;
const promises_1 = require("fs/promises");
const ejs_1 = require("ejs");
const getTemplateContentOrReadFile = async (content) => {
    const isFile = await (0, promises_1.lstat)(content)
        .then((stats) => stats.isFile())
        .catch(() => false);
    return isFile ? (0, promises_1.readFile)(content, 'utf-8') : content;
};
exports.getTemplateContentOrReadFile = getTemplateContentOrReadFile;
const getTemplatesContentOrReadFile = async (template) => {
    return Object.fromEntries(await Promise.all(Object.entries(template).map(async ([key, fileNameOrContent]) => {
        const template = await (0, exports.getTemplateContentOrReadFile)(fileNameOrContent);
        return [key, template];
    })));
};
exports.getTemplatesContentOrReadFile = getTemplatesContentOrReadFile;
const loadEmailTemplates = async (templates) => {
    const activation = await (0, exports.getTemplatesContentOrReadFile)(templates.activation);
    const onVerification = await (0, exports.getTemplatesContentOrReadFile)(templates.onVerification);
    const forgotPassword = await (0, exports.getTemplatesContentOrReadFile)(templates.forgotPassword);
    const permissionsRequest = await (0, exports.getTemplatesContentOrReadFile)(templates.permissionsRequest);
    const permissionsApprovedToUser = await (0, exports.getTemplatesContentOrReadFile)(templates.permissionsApprovedToUser);
    const renderTemplate = (templates, params) => {
        const from = (0, ejs_1.render)(templates.from, params.from);
        const subject = (0, ejs_1.render)(templates.subject, params.subject);
        const html = (0, ejs_1.render)(templates.html, params.html);
        return {
            from,
            subject,
            html,
        };
    };
    const renderActivation = (params) => {
        return renderTemplate(activation, params);
    };
    const renderVerification = (params) => {
        return renderTemplate(onVerification, params);
    };
    const renderForgotPassword = (params) => {
        return renderTemplate(forgotPassword, params);
    };
    const renderPermissionsRequest = (params) => {
        return renderTemplate(permissionsRequest, params);
    };
    const renderPermissionsApprovedToUser = (params) => {
        return renderTemplate(permissionsApprovedToUser, params);
    };
    return {
        renderActivation,
        renderVerification,
        renderForgotPassword,
        renderPermissionsRequest,
        renderPermissionsApprovedToUser,
    };
};
exports.loadEmailTemplates = loadEmailTemplates;
//# sourceMappingURL=EmailTemplates.js.map