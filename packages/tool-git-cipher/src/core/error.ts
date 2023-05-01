import { EventTypes, eventBus } from './event'
import { logger } from './logger'

// Status code of custom error.
export enum ErrorCode {
  // Invalid password.
  BAD_PASSWORD = 'BAD_PASSWORD',
  // Entered passwords differ.
  ENTERED_PASSWORD_DIFFER = 'ENTERED_PASSWORD_DIFFER',
  // Incorrect password entered.
  WRONG_PASSWORD = 'WRONG_PASSWORD',
}

export interface ICustomError {
  code: ErrorCode
  message: string
}

export function wrapErrorHandler<T extends (...args: any[]) => void | Promise<void>>(fn: T): T {
  const wrapped: T = (async (...args: Parameters<T>): Promise<void> => {
    try {
      await fn(...args)
    } catch (error: Error | ICustomError | any) {
      const code = error.code || -1
      switch (code) {
        case ErrorCode.BAD_PASSWORD:
        case ErrorCode.ENTERED_PASSWORD_DIFFER:
        case ErrorCode.WRONG_PASSWORD:
          logger.debug(error)
          logger.error(error.message ?? error.stack ?? error)
          eventBus.dispatch({ type: EventTypes.EXITING })
          break
        default:
          logger.error(error)
          eventBus.dispatch({ type: EventTypes.EXITING })
          break
      }
    }
  }) as T
  return wrapped
}
