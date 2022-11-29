import mongoose from 'mongoose'

export const connect = async (uri: string) => {
  const connection = mongoose.createConnection()

  await connection.openUri(uri)

  return connection
}
