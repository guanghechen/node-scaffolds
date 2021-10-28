import type { Action } from './action'

/**
 * Create action creator
 * @param type              Action type
 * @param payloadRequired   Whether payload is required
 */
export function createActionCreator<T extends symbol | string, P>(
  type: T,
  payloadRequired: false,
): (payload?: P) => Action<T, P>
export function createActionCreator<A extends Action<symbol | string, unknown>>(
  type: A['type'],
  payloadRequired: false,
): (payload?: A['payload']) => A

export function createActionCreator<T extends symbol | string, P>(
  type: T,
  payloadRequired: true,
): (payload: P) => Required<Action<T, P>>
export function createActionCreator<A extends Action<symbol | string, unknown>>(
  type: A['type'],
  payloadRequired: true,
): (payload: A['payload']) => A

export function createActionCreator<T extends symbol | string, P>(
  type: T,
  payloadRequired: boolean,
): ((payload?: P) => Action<T, P>) | ((payload: P) => Required<Action<T, P>>) {
  if (payloadRequired) {
    return (payload: P): Required<Action<T, P>> => {
      return { type, payload }
    }
  }
  return (payload?: P): Action<T, P> => {
    return { type, payload }
  }
}
