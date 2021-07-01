import { SimpleEventBus } from '@guanghechen/event-bus'
import { logger } from '../env/logger'
import { EventTypes } from '../util/events'

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

/**
 * handle error
 */
export function handleError(error: Error | any): void {
  const code = error.code || 0
  switch (code) {
    default:
      logger.error('error:', error.stack || error.message || error)
      eventBus.dispatch({ type: EventTypes.EXITING })
      break
  }
}
