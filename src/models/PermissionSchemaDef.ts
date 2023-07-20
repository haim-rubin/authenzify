export const PermissionSchemaDef = {
  id: String,
  name: { type: String, unique: true, required: true },
  description: String,
  isDeleted: { type: Boolean, default: false },
}
