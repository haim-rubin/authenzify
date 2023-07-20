import { RequestGenericInterface } from 'fastify'
import { TSignUp } from '../types'
import { withErrorHandlingReply } from '../errors/with-error-reply-handling'
import { SIGN_UP_SUCCEEDED } from '../api/responses'
import { cleanUser } from '../util/helpers'
interface IParams extends RequestGenericInterface {
  id: string
}
export const initUsersRoutes = ({
  usersManagement,
  configService,
  authenticated,
}) => {
  return async (webServer) => {
    await webServer.post('/sign-up', function (request, reply) {
      withErrorHandlingReply({
        reply,
        log: this.log,
      })(async () => {
        const { body } = request
        const userDetails = body as TSignUp
        this.log.info(`Sign up user email: '${userDetails.email}'`)
        const user = await usersManagement.signUp(userDetails as TSignUp)

        reply
          .status(SIGN_UP_SUCCEEDED.httpStatusCode)
          .send({ ...SIGN_UP_SUCCEEDED.httpResponse })
      })
    })

    await webServer.post('/sign-in', function (request, reply) {
      withErrorHandlingReply({
        reply,
        log: this.log,
      })(async () => {
        const { body } = request
        const userDetails = body as TSignUp
        this.log.info(`Sign in user email: '${userDetails.email}'`)

        const token = await usersManagement.signIn(userDetails as TSignUp)

        if (!configService.setCookieOnSignIn) {
          reply.send({ token })
          return
        }

        reply
          .clearCookie(configService.authorizationCookieKey)
          .setCookie(configService.authorizationCookieKey, token, {
            path: '/',
            signed: false,
            sameSite: true,
          })
          .send({ token })
      })
    })

    await webServer.get(
      '/:id',
      { preHandler: [authenticated] },
      function (request, reply) {
        withErrorHandlingReply({
          reply,
          log: this.log,
        })(async () => {
          const params = request.params as IParams
          const { id } = params
          this.log.info(`Get user by id: '${id}'`)
          const user = await usersManagement.getUser({ id })

          reply.send(cleanUser(user))
        })
      },
    )

    await webServer.get(
      '/me',
      { preHandler: [authenticated] },
      function (request, reply) {
        withErrorHandlingReply({
          reply,
          log: this.log,
        })(async () => {
          const { id } = request.requestContext.get('userInfo')
          this.log.info(`Get user 'me' by id: '${id}'`)

          const user = await usersManagement.getUser({ id })
          reply.send(cleanUser(user))
        })
      },
    )

    await webServer.get('/verify/:id/activation', function (request, reply) {
      withErrorHandlingReply({
        reply,
        log: this.log,
      })(async () => {
        const params = request.params as IParams
        const { id } = params
        this.log.info(`Verify user by activation id: '${id}'`)
        const verified = await usersManagement.verifyActivation(id)

        reply.send(verified)
      })
    })
  }
}
