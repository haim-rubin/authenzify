export const PermissionsGroupSchemaDef = {
  id: String,
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
  isDeleted: Boolean,
  permissions: Array,
}
