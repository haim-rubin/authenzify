import { Schema } from 'mongoose'
import { IUser } from '../../../../interfaces'
import { IVerification } from '../../../../interfaces/IUser'
import { UserSchemaDef } from '../../../../models/UserSchemaDef'
import { VerificationSchemaDef } from '../../../../models/VerificationSchemaDef'

export const UserSchema = new Schema<IUser>(UserSchemaDef)
export const VerificationSchema = new Schema<IVerification>(
  VerificationSchemaDef,
)
