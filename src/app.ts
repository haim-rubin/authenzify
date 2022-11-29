import fastify from 'fastify'
import { factory } from './adapters/factories'
import { IConfig } from './interfaces'
import { ConfigService } from './services/config.service'

export const initApp = async (config: IConfig) => {
  const configService = new ConfigService(config)

  const services = await factory(configService)

  const server = fastify()

  server.get('/ping', async (request, reply) => {
    return 'pong\n'
  })

  server.listen({ port: 8080, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
}
