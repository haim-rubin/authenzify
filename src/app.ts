import fastify, { RequestGenericInterface } from 'fastify'
import httpStatus = require('http-status')
import { factory } from './adapters/factories'
import { IConfig } from './interfaces'
import { ConfigService } from './services/config.service'
import { TSignUp } from './types'
import cookie from '@fastify/cookie'
import { withErrorHandlingReply } from './errors/with-error-reply-handling'
import { initVerifyToken } from './util/verify-token'

interface IParams extends RequestGenericInterface {
  id: string
}

export const usersService = async (config: IConfig) => {
  const configService = new ConfigService(config)

  const usersManagement = await factory(configService)

  const { verifyToken } = initVerifyToken({
    publicKey: config.publicKey,
    jwtOptions: config.jwtOptions,
  })

  const server = fastify()
  await server.register(cookie)

  server.post('/users/sign-up', (request, reply) => {
    withErrorHandlingReply({
      reply,
      log: { info: () => {}, error: () => {} },
    })(async () => {
      const { body: userDetails } = request
      const user = await usersManagement.signUp(userDetails as TSignUp)

      reply.send(user)
    })
  })

  server.post('/users/sign-in', (request, reply) => {
    withErrorHandlingReply({
      reply,
      log: { info: () => {}, error: () => {} },
    })(async () => {
      const { body: userDetails } = request

      const token = await usersManagement.signIn(userDetails as TSignUp)

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
    (request, reply) => {
      withErrorHandlingReply({
        reply,
        log: { info: () => {}, error: () => {} },
      })(async () => {
        const params = request.params as IParams
        const { id } = params
        const user = await usersManagement.getUser({ id })

        reply.send(user)
      })
    },
  )

  server.get('/users/verify/:id/activation', (request, reply) => {
    withErrorHandlingReply({
      reply,
      log: { info: () => {}, error: () => {} },
    })(async () => {
      const params = request.params as IParams
      const { id } = params

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
  }
}
