import { createCipheriv, randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'

const scryptPromisify = promisify(scrypt)
const iv = randomBytes(16)

export const initEncryption = ({ privateKey }) => {
  const getSalt = (length) => {
    return randomBytes(length)
  }

  const getSaltHex = (length) => {
    return getSalt(length).toString('hex')
  }
  const encrypt = async ({ expression, salt }) => {
    // Using a custom N parameter. Must be a power of two.
    const encryptedExpression = await scryptPromisify(
      expression,
      `${salt}${privateKey}`,
      64,
    )

    return encryptedExpression.toString('hex')
  }

  return {
    encrypt,
    getSalt,
    getSaltHex,
  }
}

const { encrypt, getSalt } = initEncryption({
  privateKey: 'salt',
})

const salt = getSalt(32)
const t = await encrypt({ expression: 'haimrubin', salt })
const t2 = await encrypt({ expression: 'haimrubin', salt: getSalt(32) })
console.log(t, t2)
