import fastify, { FastifyRequest, RequestGenericInterface } from 'fastify'
import { factory } from './adapters/factories'
import { IConfig } from './interfaces'
import { ConfigService } from './services/config.service'
import { TSignUp } from './types'
import cookie from '@fastify/cookie'
import { withErrorHandlingReply } from './errors/with-error-reply-handling'
import { initVerifyToken } from './util/verify-token'
import httpStatus = require('http-status')

interface IParams extends RequestGenericInterface {
  id: string
}
export const usersService = async (config: IConfig) => {
  const configService = new ConfigService(config)

  const services = await factory(configService)

  const { verifyToken } = initVerifyToken({
    publicKey: config.publicKey,
    jwtOptions: config.jwtOptions,
  })

  const server = fastify()
  await server.register(cookie)

  server.post('/users/sign-up', async (request, reply) => {
    const { body: userDetails } = request
    try {
      const user = await services.Users.signUp(userDetails as TSignUp)
      return user
    } catch (error) {
      const { httpStatusCode, code, httpStatusText } = error as {
        httpStatusCode: number
        code: string
        httpStatusText: string
      }
      reply.code(httpStatusCode).send({ code, httpStatusText, httpStatusCode })
    }
  })

  server.post('/users/sign-in', (request, reply) => {
    withErrorHandlingReply({
      reply,
      log: { info: () => {}, error: () => {} },
    })(async () => {
      const { body: userDetails } = request

      const token = await services.Users.signIn(userDetails as TSignUp)

      if (!configService.setCookieOnSignIn) {
        reply.send({ token })
        return
      }

      reply
        .setCookie(configService.authorizationCookieKey, token)
        .send({ token })
    })
  })
  const authenticated = (request, reply, next) => {
    const { [config.authorizationCookieKey]: Authorization } = request.cookies
    const verified = verifyToken(Authorization)
    if (verified) {
      next()
    } else {
      reply.status(httpStatus.UNAUTHORIZED).send({
        message: httpStatus[httpStatus.UNAUTHORIZED],
      })
    }
  }
  server.get(
    '/users/:id',
    { preHandler: [authenticated] },
    (request: FastifyRequest, reply) => {
      withErrorHandlingReply({
        reply,
        log: { info: () => {}, error: () => {} },
      })(async () => {
        const params = request.params as IParams
        const { id } = params
        const user = await services.Users.getUser({ id })

        reply.send(user)
      })
    },
  )

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
    onSignUp: services.Users.onSignUp.bind(services.Users),
    onSignUpError: services.Users.onSignUpError.bind(services.Users),
  }
}
