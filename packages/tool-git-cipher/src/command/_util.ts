import { SimpleEventBus } from '@guanghechen/event-bus'
import { logger } from '../env/logger'
import { EventTypes } from '../util/events'

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
    default:
      logger.error('error:', error.stack || error.message || error)
      eventBus.dispatch({ type: EventTypes.EXITING })
      break
  }
}
