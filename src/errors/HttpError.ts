import * as httpStatus from 'http-status'
import { HttpStatusClasses, HttpStatusExtra } from 'http-status'
import { THttpError } from '../types'

const DEFAULT_ERROR = {
  httpStatusCode: httpStatus.INTERNAL_SERVER_ERROR,
  code: 'UNKNOWN',
  httpStatusText: httpStatus[httpStatus.INTERNAL_SERVER_ERROR],
} as THttpError

class HttpError extends Error {
  httpStatusCode: number
  code: String
  httpStatusText: string | number | HttpStatusClasses | HttpStatusExtra

  constructor({ httpStatusCode, code, httpStatusText } = DEFAULT_ERROR) {
    super(`${code || httpStatus[httpStatusCode]}`)
    this.httpStatusCode = httpStatusCode
    this.code = code
    this.httpStatusText = httpStatusText

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export default HttpError
