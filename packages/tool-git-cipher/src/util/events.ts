import { SimpleEventBus } from '@guanghechen/event-bus'
import { logger } from '../env/logger'

/**
 * Status code of custom error.
 */
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

/**
 * Types of the event dispatched in the event bus.
 */
export enum EventTypes {
  /**
   * Cancelled, exit program.
   */
  CANCELED = 'CANCELED',
  /**
   * Exiting, exiting program.
   */
  EXITING = 'EXITING',
}

export const eventBus = new SimpleEventBus<EventTypes>()
  .on(EventTypes.CANCELED, () => {
    logger.info('canceled')
    eventBus.dispatch({ type: EventTypes.EXITING })
  })
  .on(EventTypes.EXITING, () => {
    setTimeout(() => {
      process.exit(0)
    }, 0)
  })

export const handleError = (error: Error | any): void => {
  const code = error.code || 0
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
