import { connect } from '../../src/adapters/databases/mongodb/connection'

export const dropDatabase = async (uri: string) => {
  const connection = await connect(uri)
  await connection.db.dropDatabase()
}
