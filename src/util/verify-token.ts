import { verify } from 'jsonwebtoken'

export const initVerifyToken = ({ publicKey, jwtOptions }) => {
  const jwtVerifyOptions = {
    ...jwtOptions,
    algorithm: [jwtOptions.algorithm],
  }
  return {
    verifyToken(token): any {
      const decoded = verify(token, publicKey, jwtVerifyOptions)
      return decoded
    },
  }
}
