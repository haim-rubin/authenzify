"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleApisProvider = void 0;
const google_auth_library_1 = require("google-auth-library");
const googleAuthClient = new google_auth_library_1.OAuth2Client();
const googleApisProvider = ({ GOOGLE_CLIENT_ID }) => ({
    async verifyClientToken({ token }) {
        const ticket = await googleAuthClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, email_verified: userVerified, exp: tokenExpiration, family_name: lastName, given_name: firstName, aud: clientId, picture: avatarUrl, sub: userId, } = payload;
        const clientIds = [].concat(clientId);
        if (!clientIds.includes(GOOGLE_CLIENT_ID)) {
            throw new Error(`Invalid clientId: ${clientIds} `);
        }
        return {
            email,
            userVerified,
            tokenExpiration,
            lastName,
            firstName,
            clientIds,
            jti: payload['jti'],
            avatarUrl,
            userId,
        };
    },
});
exports.googleApisProvider = googleApisProvider;
//# sourceMappingURL=google.js.map