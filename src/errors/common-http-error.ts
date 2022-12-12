import { UNAUTHORIZED_ERROR } from './error-codes'
import HttpError from './HttpError'

export const unauthorizedError = new HttpError(UNAUTHORIZED_ERROR)
