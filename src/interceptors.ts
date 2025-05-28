import { initVerifyToken } from './util/verify-token'

export const getAuthenticatedInterceptor = ({
  publicKey,
  jwtOptions,
  authorizationCookieKey,
}) => {
  const { verifyToken } = initVerifyToken({ publicKey, jwtOptions })
  return {
    tryToExtractUserAuthenticated(request: any): any {
      const { [authorizationCookieKey]: Authorization } = request.cookies

      if (!Authorization) {
        throw new Error(`'${authorizationCookieKey}' is ${Authorization}`)
      }
      const userInfo = verifyToken(Authorization)
      if (!userInfo) {
        throw new Error(`User token '${Authorization}' not verified`)
      }
      return userInfo
    },
  }
}
