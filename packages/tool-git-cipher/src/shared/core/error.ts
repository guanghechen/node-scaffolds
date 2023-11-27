import { ErrorCode, EventTypes } from './constant'
import { eventBus } from './event'
import { reporter } from './reporter'

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
          reporter.debug(error)
          reporter.error(error.message ?? error.stack ?? error)
          eventBus.dispatch({ type: EventTypes.EXITING })
          break
        default:
          reporter.error(error)
          eventBus.dispatch({ type: EventTypes.EXITING })
          break
      }
    }
  }) as T
  return wrapped
}
