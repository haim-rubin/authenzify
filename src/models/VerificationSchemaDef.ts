export const VerificationSchemaDef = {
  id: String,
  userId: String,
  type: String,
  isDeleted: { type: Boolean, default: false },
  extraInfo: { type: Object, default: {} },
}
