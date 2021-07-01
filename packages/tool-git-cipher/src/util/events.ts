import { SimpleEventBus } from '@guanghechen/event-bus'
import { logger } from '../env/logger'

/**
 * status code of custom error
 */
export enum ErrorCode {
  /**
   * Invalid password
   */
  BAD_PASSWORD = 'BAD_PASSWORD',
  /**
   * Entered passwords differ
   */
  ENTERED_PASSWORD_DIFFER = 'ENTERED_PASSWORD_DIFFER',
  /**
   * Incorrect password entered
   */
  WRONG_PASSWORD = 'WRONG_PASSWORD',
  /**
   * Multiple plain files associated  with a cipher file path at the same time
   */
  DUPLICATED_CIPHER_FILEPATH = 'DUPLICATED_CIPHER_FILEPATH',
  /**
   * Null pointer exception
   */
  NULL_POINTER_ERROR = 'NULL_POINTER_ERROR',
  /**
   * The specified filepath cannot be found
   */
  FILEPATH_NOT_FOUND = 'FILEPATH_NOT_FOUND',
}

/**
 *
 */
export interface CustomError {
  /**
   *
   */
  code: ErrorCode
  /**
   *
   */
  message: string
}

/**
 * types of the event dispatched in the event bus
 */
export enum EventTypes {
  /**
   * Cancelled, exit program
   */
  CANCELED = 'CANCELED',
  /**
   * Exiting, exiting program
   */
  EXITING = 'EXITING',
}

export const eventBus = new SimpleEventBus<EventTypes>()

eventBus.on(EventTypes.CANCELED, function () {
  logger.info('canceled')
  logger.debug('canceled.')
  eventBus.dispatch({ type: EventTypes.EXITING })
})

eventBus.on(EventTypes.EXITING, function () {
  setTimeout(() => {
    process.exit(0)
  }, 0)
})
