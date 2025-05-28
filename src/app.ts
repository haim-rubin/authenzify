import fastify from 'fastify'
import { fastifyRequestContext } from '@fastify/request-context'
import { factory } from './adapters/factories'
import { IConfig } from './interfaces'
import { ConfigService } from './services/config.service'
import cookie from '@fastify/cookie'
import { getAuthenticatedInterceptor } from './interceptors'
import { UsersManagement } from './adapters/business-logic/users-management'
import { initUsersRoutes } from './app-routes/users-routes'

export const usersService = async (config: IConfig) => {
  const configService = new ConfigService(config)
  const usersManagement: UsersManagement = await factory(configService)
  const webServer = fastify({ logger: configService.logger })

  await webServer.register(cookie)
  await webServer.register(fastifyRequestContext, {
    defaultStoreValues: {
      userInfo: { id: 'system' },
    },
  })
  const { publicKey, jwtOptions, authorizationCookieKey } = config
  const { tryToExtractUserAuthenticated } = getAuthenticatedInterceptor({
    publicKey,
    jwtOptions,
    authorizationCookieKey,
  })
  webServer.register(
    initUsersRoutes({
      usersManagement,
      configService,
      tryToExtractUserAuthenticated,
    }),
    { prefix: configService.usersRoutesPrefix },
  )
  webServer.listen(
    { port: configService.port, host: configService.host },
    (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log(`Server listening at ${address}`)
    },
  )

  return {
    server: webServer,
    usersManagement,
  }
}
