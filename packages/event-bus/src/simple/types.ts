import type {
  Event,
  EventHandler,
  EventListener,
  EventPayload,
  EventSubscriber,
  EventType,
} from '../types'

/**
 * Type of SimpleEvent
 */
export type SimpleEventType = EventType

/**
 * Payload of SimpleEvent
 */
export type SimpleEventPayload = EventPayload

/**
 * Simple event
 */
export type SimpleEvent<
  T extends SimpleEventType = SimpleEventType,
  P extends SimpleEventPayload = SimpleEventPayload,
> = Event<T, P>

/**
 * SimpleEvent handler
 */
export type SimpleEventHandler<
  T extends SimpleEventType = SimpleEventType,
  P extends SimpleEventPayload = SimpleEventPayload,
  E extends SimpleEvent<T, P> = SimpleEvent<T, P>,
> = EventHandler<T, P, E>

/**
 * SimpleEvent subscriber
 */
export type SimpleEventSubscriber<
  T extends SimpleEventType = SimpleEventType,
  P extends SimpleEventPayload = SimpleEventPayload,
  E extends SimpleEvent<T, P> = SimpleEvent<T, P>,
> = EventSubscriber<T, P, E>

/**
 * SimpleEvent listener
 */
export type SimpleEventListener<
  T extends SimpleEventType = SimpleEventType,
  P extends SimpleEventPayload = SimpleEventPayload,
  E extends SimpleEvent<T, P> = SimpleEvent<T, P>,
> = EventListener<T, P, E>
