import httpStatus from 'http-status'

export const SIGN_UP_ERRORS = {
  INVALID_USERNAME_POLICY: {
    httpStatusCode: httpStatus.BAD_REQUEST,
    code: 'SIGN_UP.INVALID_USERNAME_POLICY',
  },
  INVALID_PASSWORD_POLICY: {
    httpStatusCode: httpStatus.BAD_REQUEST,
    code: 'SIGN_UP.INVALID_PASSWORD_POLICY',
  },
  USER_ALREADY_EXISTS: {
    httpStatusCode: httpStatus.CONFLICT,
    code: 'SIGN_UP.USER_ALREADY_EXISTS',
  },
}
