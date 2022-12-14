import { before } from 'mocha'
import { usersService } from '../../../src/app'
import { dropDatabase } from '../../util/mongodb-util'
import { getConfig } from '../../util/settings'
import { ACTIVATE_USER_BY } from '../../../src/constant'
import { UsersManagement } from '../../../src/adapters/business-logic/users-management'

describe('Sign up', async () => {
  let server
  let config
  const credentials = {
    email: 'haim@tictuk.com',
    password: '1@Ea5S',
  }
  let usersManagement: UsersManagement
  before(async () => {
    config = await getConfig({ port: 9394 })
    await dropDatabase(config.uri)
    const userService = await usersService(config)
    server = userService.server
    usersManagement = userService.usersManagement
    await server.inject().post('/users/sign-up').body(credentials)
  })

  describe(`Verify user by '${ACTIVATE_USER_BY.AUTO}'`, () => {
    it('Should verify user calling verify API', async () => {
      const res = await server.inject().post('/users/sign-in').body(credentials)
      const tokenRes = res.json()
      ///users/verify/:id/activation

      // const { email } = user.json()
      // assert.equal(email, credentials.email)
    })
  })
})
