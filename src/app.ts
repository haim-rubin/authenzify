import fastify, { RequestGenericInterface } from 'fastify'
import { fastifyRequestContext } from '@fastify/request-context'
import { factory } from './adapters/factories'
import { IConfig } from './interfaces'
import { ConfigService } from './services/config.service'
import { TSignUp } from './types'
import cookie from '@fastify/cookie'
import { withErrorHandlingReply } from './errors/with-error-reply-handling'
import { SIGN_UP_SUCCEEDED } from './api/responses'
import { getAuthenticatedInterceptor } from './interceptors'
import { UsersManagement } from './adapters/business-logic/users-management'
import { cleanUser } from './util/helpers'
interface IParams extends RequestGenericInterface {
  id: string
}

export const usersService = async (config: IConfig) => {
  const configService = new ConfigService(config)
  const usersManagement: UsersManagement = await factory(configService)
  const server = fastify({ logger: true })

  await server.register(cookie)
  await server.register(fastifyRequestContext, {
    defaultStoreValues: {
      userInfo: { id: 'system' },
    },
  })
  const { authenticated } = getAuthenticatedInterceptor(config)

  server.post('/users/sign-up', function (request, reply) {
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

  server.post('/users/sign-in', function (request, reply) {
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

  server.get(
    '/users/:id',
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

  server.get(
    '/users/me',
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

  server.get('/users/verify/:id/activation', function (request, reply) {
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

  server.listen(
    { port: config.port || 9090, host: config.host || '0.0.0.0' },
    (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Server listening at ${address}`)
    },
  )

  return {
    server,
    usersManagement,
  }
}
