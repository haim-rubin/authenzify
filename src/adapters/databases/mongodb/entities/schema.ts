import { Schema } from 'mongoose'
import { IUser } from '../../../../interfaces'
import { TUser } from '../../../../models/User'

export const UserSchema = new Schema<IUser>(TUser)
