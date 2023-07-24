import { unauthorizedError } from './errors/common-http-error'
import { withErrorHandlingReply } from './errors/with-error-reply-handling'
import { initVerifyToken } from './util/verify-token'

export const getAuthenticatedInterceptor = ({
  publicKey,
  jwtOptions,
  authorizationCookieKey,
  defaultError = unauthorizedError,
}) => {
  const { verifyToken } = initVerifyToken({ publicKey, jwtOptions })
  return {
    authenticated(request, reply, next) {
      const { [authorizationCookieKey]: Authorization } = request.cookies
      withErrorHandlingReply({
        reply,
        log: this.log,
        defaultError,
      })(() => {
        if (!Authorization) {
          throw new Error(`'${authorizationCookieKey}' is ${Authorization}`)
        }
        const userInfo = verifyToken(Authorization)
        if (!userInfo) {
          throw new Error(`User token '${Authorization}' not verified`)
        }
        request.requestContext.set('userInfo', userInfo)
        next()
      })
    },
  }
}
