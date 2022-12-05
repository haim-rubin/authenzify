export const enumerateError = (originError) => {
  originError.toJSON = function () {
    const objectKeys = Object.getOwnPropertyNames(this)
    const allProps = objectKeys.reduce(
      (props, key) => ({
        ...props,
        [key]: this[key],
      }),
      {},
    )

    return allProps
  }

  return originError
}

export const stringifyError = (error) => {
  return JSON.stringify(enumerateError(error))
}
