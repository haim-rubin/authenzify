import { Schema } from 'mongoose'

export type ModelCollectionPair = {
  modelInfo: { key: string; schema: Schema }
  collectionInfo: { name: string; alias: string }
}

export type TModelsCollections = {
  users: { find: Function; findOne: Function }
  User: { create: Function }
}
