import { EventBus } from '@guanghechen/event-bus'
import { reporter } from './reporter'

// Types of the event dispatched in the event bus.
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

export const eventBus = new EventBus<EventTypes>()
  .on(EventTypes.CANCELED, (_evt, eb) => {
    reporter.info('canceled')
    eb.dispatch({ type: EventTypes.EXITING })
  })
  .on(EventTypes.EXITING, () => {
    process.exit(0)
  })
