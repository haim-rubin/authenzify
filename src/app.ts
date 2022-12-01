import fastify from 'fastify'
import { factory } from './adapters/factories'
import { IConfig } from './interfaces'
import { ConfigService } from './services/config.service'
import { TSignUp } from './types'

export const initApp = async (config: IConfig) => {
  const configService = new ConfigService(config)

  const services = await factory(configService)

  const server = fastify()

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

  server.listen({ port: 9090, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
}

// const config = {
//   verifyUserBy: 'AUTO',
//   passwordPolicy: '',
//   usernamePolicy: '',
//   storage: 'mongodb',
//   uri: 'mongodb://localhost:27017/users-management-test',
//   saltLength: 32,
//   privateKey: '',
// }

// initApp(config)
