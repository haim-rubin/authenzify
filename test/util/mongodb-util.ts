import { connect } from '../../src/adapters/databases/mongodb/connection'

export const dropDatabase = async (config: any) => {
  const connection = await connect(config)
  await connection.db.dropDatabase()
}
