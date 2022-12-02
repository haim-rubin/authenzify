import { randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'
const scryptPromisify = promisify(scrypt)

const keyLength = 64
const baseFormat = 'hex'

export const getSalt = (length: number) => {
  return randomBytes(length)
}

export const getSaltHex = (length: number) => {
  return getSalt(length).toString(baseFormat)
}

const getEncryptedBuffer = async ({
  expression,
  salt,
}: {
  expression: string
  salt: string
}): Promise<Buffer> => {
  const encryptedExpression = (await scryptPromisify(
    expression,
    salt,
    keyLength,
  )) as Buffer

  return encryptedExpression
}

export const encrypt = async ({
  expression,
  salt,
  passwordPrivateKey,
}: {
  expression: string
  salt: string
  passwordPrivateKey: string
}): Promise<string> => {
  const encryptedExpression = await getEncryptedBuffer({
    expression,
    salt: `${salt}${passwordPrivateKey ? passwordPrivateKey : ''}`,
  })

  return encryptedExpression.toString(baseFormat)
}

export const doesPasswordMatch = async ({
  password,
  encryptedPassword,
  salt,
}): Promise<Boolean> => {
  const encryptedCurrentPassword = await getEncryptedBuffer({
    expression: password,
    salt,
  })
  const isMatch = encryptedCurrentPassword.equals(
    Buffer.from(encryptedPassword, baseFormat),
  )
  return isMatch
}
