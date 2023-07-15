import mongoose from 'mongoose'

export const connect = async (config: any) => {
  const connection = mongoose.createConnection()

  await connection.openUri(config.uri, config.options)

  return connection
}
