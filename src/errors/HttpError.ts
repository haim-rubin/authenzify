import httpStatus from 'http-status'
import { THttpError } from '../types'

const DEFAULT_ERROR = {
  httpStatusCode: httpStatus.INTERNAL_SERVER_ERROR,
  code: 'UNKNOWN',
} as THttpError

class HttpError extends Error {
  httpStatusCode: number
  code: String
  constructor({ httpStatusCode, code } = DEFAULT_ERROR) {
    super(`${code || httpStatus[httpStatusCode]}`)
    this.httpStatusCode = httpStatusCode
    this.code = code

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export default HttpError
