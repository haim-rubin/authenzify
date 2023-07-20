import { Schema } from 'mongoose'
import { IUser } from '../../../../interfaces'
import { IVerification } from '../../../../interfaces/IVerificationService'
import { UserSchemaDef } from '../../../../models/UserSchemaDef'
import { VerificationSchemaDef } from '../../../../models/VerificationSchemaDef'
import { PermissionSchemaDef } from '../../../../models/PermissionSchemaDef'
import { PermissionsGroupSchemaDef } from '../../../../models/PermissionsGroupSchemaDef'

export const UserSchema = new Schema<IUser>(UserSchemaDef)
export const VerificationSchema = new Schema<IVerification>(
  VerificationSchemaDef,
)
export const PermissionSchema = new Schema(PermissionSchemaDef)
export const PermissionsGroupSchema = new Schema(PermissionsGroupSchemaDef)
PermissionsGroupSchema.index(
  {
    tenantId: 1,
    name: 1,
  },
  { unique: true },
)
