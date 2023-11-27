import { EventBus } from '@guanghechen/event-bus'
import { EventTypes } from './constant'
import { reporter } from './reporter'

export const eventBus = new EventBus<EventTypes>()
  .on(EventTypes.CANCELED, (_evt, eb) => {
    reporter.info('canceled')
    eb.dispatch({ type: EventTypes.EXITING })
  })
  .on(EventTypes.EXITING, () => {
    process.exit(0)
  })
