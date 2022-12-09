export const mapMongoDbId = (mongodbObject: any) => {
  if (!mongodbObject || typeof mongodbObject !== 'object') {
    return null
  }

  return {
    ...mongodbObject,
    id: mongodbObject._id.toString(),
  }
}
