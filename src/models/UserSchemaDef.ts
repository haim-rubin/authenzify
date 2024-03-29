export const UserSchemaDef = {
  id: String,
  email: String,
  firstName: String,
  lastName: String,
  username: String,
  isValid: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  password: String,
  salt: String,
}
