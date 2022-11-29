import { factory } from '../../src/adapters/factories'
import { initApp } from '../../src/app'
import { ConfigService } from '../../src/services/config.service'
describe('Sign up', () => {
  const config = {
    verifyUserBy: 'AUTO',
    passwordPolicy: '',
    usernamePolicy: '',
    storage: 'mongodb',
    uri: 'mongodb://localhost:27017/users-management',
    saltLength: 32,
    privateKey: '',
  }
  it('should sign up', async () => {
    const configService = new ConfigService(config)

    const services = await factory(configService)
    const user = services.Users.signUp({ username: 'haim', password: '123456' })
  })
})
