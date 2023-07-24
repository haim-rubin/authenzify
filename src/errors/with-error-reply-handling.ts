import { GENERAL_ERROR } from './error-codes'
import { stringifyError } from './error-util.js'
import HttpError from './HttpError'

export const withErrorHandling =
  (log, defaultError): Function =>
  async (funcToInvoke): Promise<any> => {
    try {
      return await funcToInvoke()
    } catch (error) {
      log.error(`[!] [withErrorHandling] - Error: ${JSON.stringify(error)}`)

      throw HttpError.isInstanceOf(error) ? error : defaultError
    }
  }

export const withErrorHandlingReply =
  ({ reply, log, defaultError = new HttpError(GENERAL_ERROR) }): Function =>
  async (funcToInvoke) => {
    try {
      return await withErrorHandling(log, defaultError)(funcToInvoke)
    } catch (error) {
      const { httpStatusCode, code, httpStatusText } = error
      reply.status(httpStatusCode).send({ code, httpStatusText })
    }
  }

export const replyOnErrorOnly =
  ({ reply, log, defaultError = GENERAL_ERROR }) =>
  async (funcToInvoke): Promise<any> => {
    try {
      return await withErrorHandling(log, defaultError)(funcToInvoke)
    } catch (error) {
      log.error(`[!] [replyOnErrorOnly] Error: ${error?.valueOf()}`)
      const errorMerged = HttpError.isInstanceOf(error)
        ? error
        : { ...error, ...defaultError }

      reply.status(errorMerged.statusCode).send({ error: errorMerged.exposed })
    }
  }
