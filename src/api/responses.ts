import * as httpStatus from 'http-status'

export const SIGN_UP_SUCCEEDED = {
  httpStatusCode: httpStatus.CREATED,
  code: 'SIGN_UP.USER_CREATED',
  httpResponse: { message: httpStatus[httpStatus.CREATED] },
}
