export type IEventType = number | string | symbol
export type IEventPayload = number | boolean | string | symbol | object

export interface IEvent<
  T extends IEventType = IEventType,
  P extends IEventPayload = IEventPayload,
> {
  type: T
  payload?: P
}

export interface IEventHandler<
  T extends IEventType = IEventType,
  P extends IEventPayload = IEventPayload,
  E extends IEvent<T, P> = IEvent<T, P>,
> {
  /**
   * The returned value will be ignored
   * @param evt
   */
  (evt: Readonly<E>, eventBus: IEventBus<T>): void
}

export interface IEventSubscriber<
  T extends IEventType = IEventType,
  P extends IEventPayload = IEventPayload,
  E extends IEvent<T, P> = IEvent<T, P>,
> {
  /**
   * An one-off subscriber which would be unregistered from EventBus after first called.
   */
  once: boolean
  /**
   * Event handler.
   */
  handle: IEventHandler<T, P, E>
}

export interface IEventListener<
  T extends IEventType = IEventType,
  P extends IEventPayload = IEventPayload,
  E extends IEvent<T, P> = IEvent<T, P>,
> {
  /**
   * An one-off subscriber which would be unregistered from EventBus after first called.
   */
  once: boolean
  /**
   * Event handler.
   */
  handle: IEventHandler<T, P, E>
}

export interface IEventBus<T extends IEventType> {
  /**
   * Listen the special type event.
   * @param type
   * @param handle
   */
  on<P extends IEventPayload = IEventPayload, E extends IEvent<T, P> = IEvent<T, P>>(
    type: T,
    handle: IEventHandler<T, P, E>,
  ): this

  /**
   * Listen the special type event, and will be auto-removed once it called.
   * @param type
   * @param handle
   */
  once<P extends IEventPayload = IEventPayload, E extends IEvent<T, P> = IEvent<T, P>>(
    type: T,
    handle: IEventHandler<T, P, E>,
  ): this

  /**
   * Register an event listener to subscribe special type event.
   *
   * @param type
   * @param handle
   * @param once    If true, will be auto-removed once it called.
   */
  addListener<P extends IEventPayload = IEventPayload, E extends IEvent<T, P> = IEvent<T, P>>(
    type: T,
    handle: IEventHandler<T, P, E>,
    once: boolean,
  ): this

  /**
   * Unregister an event listener on special type event.
   * @param type
   * @param handle
   */
  removeListener<P extends IEventPayload = IEventPayload, E extends IEvent<T, P> = IEvent<T, P>>(
    type: T,
    handle: IEventHandler<T, P, E>,
  ): this

  /**
   * Subscribe all type events.
   * @param handle
   * @param once    If true, will be auto-removed once it called.
   */
  subscribe<P extends IEventPayload = IEventPayload, E extends IEvent<T, P> = IEvent<T, P>>(
    handle: IEventHandler<T, P, E>,
    once: boolean,
  ): this

  /**
   * Cancel subscription.
   * @param handle
   */
  unsubscribe<P extends IEventPayload = IEventPayload, E extends IEvent<T, P> = IEvent<T, P>>(
    handle: IEventHandler<T, P, E>,
  ): this

  /**
   * Publish an event.
   * @param evt
   */
  dispatch<P extends IEventPayload = IEventPayload, E extends IEvent<T, P> = IEvent<T, P>>(
    evt: Readonly<E>,
  ): this

  /**
   * Remove all listeners and subscribers.
   */
  cleanup(): this
}
