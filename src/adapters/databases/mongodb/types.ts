import { Schema } from 'mongoose'

export type ModelCollectionPair = {
  modelInfo: { key: string; schema: Schema }
  collectionInfo: { name: string; alias: string }
}

export type TModelsCollections = {
  users: { find: Function }
  User: {
    create: Function
    findOne: Function
    find: Function
    findById: Function
    updateOne: Function
    startSession: Function
  }
  Verification: {
    create: Function
    findOne: Function
    find: Function
    findById: Function
    updateOne: Function
  }
  Permission: {
    create: Function
    findOne: Function
    find: Function
    findById: Function
    updateOne: Function
  }

  PermissionsGroup: {
    create: Function
    findOne: Function
    find: Function
    findById: Function
    updateOne: Function
  }

  connection
}
