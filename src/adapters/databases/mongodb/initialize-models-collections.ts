import { Connection } from 'mongoose'
import { ModelCollectionPair, TModelsCollections } from './types'

export const initModelsCollections = ({
  connection,
  modelsInfo,
}: {
  connection: Connection
  modelsInfo: Array<ModelCollectionPair>
}): TModelsCollections => {
  const models = modelsInfo.reduce(
    (models, { modelInfo, collectionInfo: { name, alias } }) => {
      const { key, schema } = modelInfo
      const model = connection.model(key, schema)
      const collection = connection.collection(name)
      return {
        ...models,
        [key]: model,
        [alias]: collection,
        connection,
      }
    },
    {},
  ) as TModelsCollections

  return models
}
