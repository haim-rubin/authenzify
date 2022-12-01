import { createCipheriv, randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'

const scryptPromisify = promisify(scrypt)

export const getSalt = (length: number) => {
  return randomBytes(length)
}

export const getSaltHex = (length: number) => {
  return getSalt(length).toString('hex')
}

export const encrypt = async ({
  expression,
  salt,
  privateKey,
}: {
  expression: string
  salt: string
  privateKey: string
}): Promise<string> => {
  // Using a custom N parameter. Must be a power of two.
  const encryptedExpression = (await scryptPromisify(
    expression,
    `${salt}${privateKey ? privateKey : ''}`,
    64,
  )) as Buffer

  return encryptedExpression.toString('hex')
}
