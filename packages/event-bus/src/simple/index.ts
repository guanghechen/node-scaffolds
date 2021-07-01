import type {
  SimpleEvent,
  SimpleEventHandler,
  SimpleEventListener,
  SimpleEventSubscriber,
  SimpleEventType,
} from './types'

export * from './types'

/**
 * Only a simple publish/subscribe mechanism is provided, and the event bus does
 * not care whether the subscriber processes the event correctly, it only
 * cares about whether the event is delivered to its subscribers; what needs to
 * be noted is:
 *
 *  - All subscriber received the events in parallel, although they receive
 *    events in the order of subscription. That is, it does not provide a
 *    guarantee that the previous subscriber will always complete the processing
 *    before the next subscriber receives the event.
 *
 *  - When a subscriber's processing function throws an Error, the message
 *    delivery on the bus will be interrupted.
 */
export class SimpleEventBus<T extends SimpleEventType> {
  protected listeners: Record<T, Array<SimpleEventListener<T>>>
  protected subscribers: Array<SimpleEventSubscriber<T>>

  constructor() {
    this.listeners = {} as unknown as Record<T, Array<SimpleEventListener<T>>>
    this.subscribers = []
  }

  /**
   * Add SimpleEvent listener
   * @param type
   * @param handle
   * @see this#addEventListener
   */
  public on(type: T, handle: SimpleEventHandler<T>): this {
    return this.addEventListener(type, handle, false)
  }

  /**
   * Add SimpleEvent listener
   * @param type
   * @param handle
   * @see this#addEventListener
   */
  public once(type: T, handle: SimpleEventHandler<T>): this {
    return this.addEventListener(type, handle, true)
  }

  /**
   * Add SimpleEvent listener
   * @param type
   * @param handle
   */
  public addEventListener(
    type: T,
    handle: SimpleEventHandler<T>,
    once: boolean,
  ): this {
    const listeners = this.listeners[type] || []

    // An event listener can only be registered once for each particular event
    if (listeners.find(x => x.handle === handle)) {
      return this
    }

    const realListener: SimpleEventListener<T> = { once, handle }
    listeners.push(realListener)
    this.listeners[type] = listeners
    return this
  }

  /**
   * Remove SimpleEvent listener
   * @param type
   * @param handle
   */
  public removeEventListener(type: T, handle: SimpleEventHandler<T>): this {
    const listeners = this.listeners[type]
    if (listeners != null) {
      this.listeners[type] = listeners.filter(x => x.handle !== handle)
    }
    return this
  }

  /**
   * Subscribe to the SimpleEvent
   * @param handle
   */
  public subscribe(handle: SimpleEventHandler<T>, once: boolean): this {
    const subscribers = this.subscribers

    // A subscriber can only be registered once
    if (subscribers.find(x => x.handle === handle)) {
      return this
    }

    const realSubscriber: SimpleEventSubscriber<T> = { once, handle }
    subscribers.push(realSubscriber)
    return this
  }

  /**
   * Cancel Subscription
   * @param handle
   */
  public unsubscribe(handle: SimpleEventHandler<T>): this {
    this.subscribers = this.subscribers.filter(x => x.handle !== handle)
    return this
  }

  /**
   * dispatch SimpleEvent & emit notification to subscribers and listeners
   * @param evt
   */
  public dispatch(evt: Readonly<SimpleEvent<T>>): this {
    // trigger subscribers
    const subscribers = this.subscribers
    for (const subscriber of subscribers) {
      subscriber.handle(evt)
      if (subscriber.once) {
        this.unsubscribe(subscriber.handle)
      }
    }

    // trigger listeners
    const listeners = this.listeners[evt.type]
    if (listeners != null) {
      for (const listener of listeners) {
        listener.handle(evt)
        if (listener.once) {
          this.removeEventListener(evt.type, listener.handle)
        }
      }
    }
    return this
  }

  public clear(): this {
    this.listeners = {} as unknown as Record<T, Array<SimpleEventListener<T>>>
    this.subscribers = []
    return this
  }
}
