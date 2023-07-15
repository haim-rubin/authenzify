"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initNodemailer = void 0;
const nodemailer = require("nodemailer");
const initNodemailer = ({ port, secure = false, auth }) => {
    const { user, pass } = auth;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port,
        secure,
        auth: {
            user,
            pass,
        },
    });
    return {
        sendMail: transporter.sendMail.bind(transporter),
    };
};
exports.initNodemailer = initNodemailer;
//# sourceMappingURL=nodemailer.js.map