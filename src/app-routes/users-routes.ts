import { RequestGenericInterface } from 'fastify'
import { TSignUp } from '../types'
import { withErrorHandlingReply } from '../errors/with-error-reply-handling'
import { SIGN_UP_SUCCEEDED } from '../api/responses'
import { cleanUser } from '../util/helpers'
import { UsersManagement } from '../adapters/business-logic/users-management'
import { ConfigService } from '../services/config.service'
import HttpError from '../errors/HttpError'
import { SIGN_IN_ERRORS } from '../errors/error-codes'
import httpStatus = require('http-status')
interface IParams extends RequestGenericInterface {
  id: string
}
type TryToExtractUserAuthenticatedFunction = (request: any) => any

export const initUsersRoutes = ({
  usersManagement,
  configService,
  tryToExtractUserAuthenticated,
}: {
  usersManagement: UsersManagement
  configService: ConfigService
  tryToExtractUserAuthenticated: TryToExtractUserAuthenticatedFunction
}) => {
  const replyToken = ({ token, reply }, payload = {}) => {
    if (!configService.setCookieOnSignIn) {
      reply.send({ ...payload, token })
      return
    }

    reply
      .clearCookie(configService.authorizationCookieKey)
      .setCookie(configService.authorizationCookieKey, token, {
        path: '/',
        signed: false,
        sameSite: true,
      })
      .send({ ...payload, token })
  }

  const validateAuthentication = async (request: any, reply: any) => {
    try {
      const userInfo = await tryToExtractUserAuthenticated(request)
      request.requestContext.set('userInfo', userInfo)
    } catch (error) {
      reply
        .status(httpStatus.UNAUTHORIZED)
        .send({ message: httpStatus[httpStatus.UNAUTHORIZED] })
      return reply
    }
  }

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
        this.log.info(
          `Succeeded to create user: { email: ${user.email}, id: ${user.id} }`,
        )
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

        replyToken({ token, reply })
      })
    })

    await webServer.get(
      '/:id',
      {
        preHandler: [validateAuthentication],
      },
      function (request, reply) {
        withErrorHandlingReply({
          reply,
          log: this.log,
        })(async () => {
          const params = request.params as IParams
          const { id } = params
          this.log.info(`Get user by id: '${id}'`)
          const user = await usersManagement.getUser({ id })
          if (!user) {
            throw new HttpError(SIGN_IN_ERRORS.USER_NOT_EXIST)
          }
          reply.send(cleanUser(user))
        })
      },
    )

    await webServer.get(
      '/me',
      { preHandler: [validateAuthentication] },
      function (request, reply) {
        withErrorHandlingReply({
          reply,
          log: this.log,
        })(async () => {
          const { id } = request.requestContext.get('userInfo')
          this.log.info(`Get user 'me' by id: '${id}'`)

          const user = await usersManagement.getUser({ id })
          if (!user) {
            throw new HttpError(SIGN_IN_ERRORS.USER_NOT_EXIST)
          }
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

        reply.send({ verified })
      })
    })

    await webServer.post(
      '/:id/permissions',
      { preHandler: [validateAuthentication] },
      function (request, reply) {
        withErrorHandlingReply({
          reply,
          log: this.log,
        })(async () => {
          const { id } = request.params

          const userInfo = request.requestContext.get('userInfo')

          const { body: companyDetails } = request

          const { isAdminUser, token } =
            await usersManagement.requestPermissionForUser({
              companyDetails,
              userInfo,
              id,
            })

          if (isAdminUser) {
            replyToken({ token, reply }, { isAdminUser, emailSent: false })
            return
          }

          reply.send({ emailSent: true, isAdminUser })
        })
      },
    )

    await webServer.get(
      '/verify/:id/permissions/:role',
      { preHandler: [validateAuthentication] },
      function (request, reply) {
        withErrorHandlingReply({
          reply,
          log: this.log,
        })(async () => {
          const { id, role } = request.params
          const userInfo = request.requestContext.get('userInfo')
          const verified = await usersManagement.verifyUserPermissionRequest({
            verificationId: id,
            role,
            userInfo,
          })

          reply.send({ verified })
        })
      },
    )

    await webServer.post(
      '/change-password',
      { preHandler: [validateAuthentication] },
      function (request, reply) {
        withErrorHandlingReply({
          reply,
          log: this.log,
        })(async () => {
          const userInfo = request.requestContext.get('userInfo')

          const {
            body: { password, newPassword },
          } = request

          const passwordChanged = await usersManagement.changePassword({
            password,
            newPassword,
            userInfo,
          })

          reply.send({ passwordChanged })
        })
      },
    )

    await webServer.post('/forgot-password', function (request, reply) {
      withErrorHandlingReply({
        reply,
        log: this.log,
      })(async () => {
        const {
          body: { email },
          log,
        } = request
        try {
          const passwordChanged = await usersManagement.forgotPassword({
            email,
          })

          reply.send({ passwordChanged })
        } catch (error) {
          log.error(error)
          reply.send({ passwordChanged: true })
        }
      })
    })

    await webServer.post(
      '/verify/:verificationId/apply-forgot-password',
      function (request, reply) {
        withErrorHandlingReply({
          reply,
          log: this.log,
        })(async () => {
          const {
            params,
            body: { newPassword },
            log,
          } = request
          const { verificationId } = params
          try {
            const passwordChanged = await usersManagement.applyForgotPassword({
              newPassword,
              verificationId,
            })

            reply.send({ passwordChanged })
          } catch (error) {
            log.error(error)
            reply.send({ passwordChanged: true })
          }
        })
      },
    )

    await webServer.post('/sign-in-google', function (request, reply) {
      withErrorHandlingReply({
        reply,
        log: this.log,
      })(async () => {
        const { body } = request
        this.log.info(`Sign in user email: '${'userDetails.email'}'`)
        const token = await usersManagement.signInGoogle(body)
        replyToken({ token, reply })
      })
    })
  }
}
