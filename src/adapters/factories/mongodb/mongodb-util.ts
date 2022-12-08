export const mapMongoDbId = (mongodbObject: any) => {
  return {
    ...mongodbObject,
    id: mongodbObject._id.toString(),
  }
}
