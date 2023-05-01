import { filterInPlace } from '@guanghechen/helper-func'
import type {
  IEvent,
  IEventBus,
  IEventHandler,
  IEventListener,
  IEventPayload,
  IEventSubscriber,
  IEventType,
} from './types'

/**
 * A simple event bus implementation that provides a simple publish-subscribe mechanism.
 *
 * This event bus does not care whether the listener / subscriber handled the event appropriately,
 * it only cares about whether the event is delivered to its listeners / subscribers, that is:
 *
 *  - When dispatch an event, all listeners / subscribers will be notified in sequence in the order
 *    of subscription time. It does not provide a guarantee that the previous listener / subscriber
 *    will always complete the processing before the next subscriber receives the event.
 *
 *  - When a listener / subscriber throws an exception while processing, the distribution of this
 *    event will be aborted, that is, other subsequent listeners / subscribers will not receive this
 *    event.
 */
export class EventBus<T extends IEventType> implements IEventBus<T> {
  protected listeners: Map<T, Array<IEventListener<T>>>
  protected subscribers: Array<IEventSubscriber<T>>

  constructor() {
    this.listeners = new Map<T, Array<IEventListener<T>>>()
    this.subscribers = []
  }

  public on<P extends IEventPayload = IEventPayload, E extends IEvent<T, P> = IEvent<T, P>>(
    type: T,
    handle: IEventHandler<T, P, E>,
  ): this {
    return this.addListener(type, handle, false)
  }

  public once<P extends IEventPayload = IEventPayload, E extends IEvent<T, P> = IEvent<T, P>>(
    type: T,
    handle: IEventHandler<T, P, E>,
  ): this {
    return this.addListener(type, handle, true)
  }

  public addListener<
    P extends IEventPayload = IEventPayload,
    E extends IEvent<T, P> = IEvent<T, P>,
  >(type: T, handle: IEventHandler<T, P, E>, once: boolean): this {
    let listeners = this.listeners.get(type)
    if (!listeners) {
      listeners = []
      this.listeners.set(type, listeners)
    }

    // An event handle can only be registered once.
    const listener = listeners.find(listener => listener.handle === handle)
    if (listener) {
      listener.once = once
      return this
    }

    listeners.push({ once, handle: handle as IEventHandler<T> })
    return this
  }

  public removeListener<
    P extends IEventPayload = IEventPayload,
    E extends IEvent<T, P> = IEvent<T, P>,
  >(type: T, handle: IEventHandler<T, P, E>): this {
    const listeners = this.listeners.get(type)
    if (listeners) {
      filterInPlace(listeners, listener => listener.handle !== handle)
    }
    return this
  }

  public subscribe<P extends IEventPayload = IEventPayload, E extends IEvent<T, P> = IEvent<T, P>>(
    handle: IEventHandler<T, P, E>,
    once: boolean,
  ): this {
    // A subscriber can only be registered once
    const subscriber = this.subscribers.find(subscriber => subscriber.handle === handle)
    if (subscriber) {
      subscriber.once = once
      return this
    }

    this.subscribers.push({ once, handle: handle as IEventHandler<T> })
    return this
  }

  public unsubscribe<
    P extends IEventPayload = IEventPayload,
    E extends IEvent<T, P> = IEvent<T, P>,
  >(handle: IEventHandler<T, P, E>): this {
    filterInPlace(this.subscribers, subscriber => subscriber.handle !== handle)
    return this
  }

  public dispatch<P extends IEventPayload = IEventPayload, E extends IEvent<T, P> = IEvent<T, P>>(
    evt: Readonly<E>,
  ): this {
    {
      // trigger subscribers
      const subscribers = this.subscribers
      for (const subscriber of subscribers) subscriber.handle(evt, this)

      // Remove one-time subscribers
      filterInPlace(this.subscribers, subscriber => !subscriber.once)
    }

    // trigger listeners
    const listeners = this.listeners.get(evt.type)
    if (listeners) {
      for (const listener of listeners) listener.handle(evt, this)

      // Remove one-time listeners
      filterInPlace(listeners, listener => !listener.once)
    }
    return this
  }

  public cleanup(): this {
    this.listeners.clear()
    this.subscribers = []
    return this
  }
}
