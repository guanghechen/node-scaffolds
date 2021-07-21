import type {
  AsyncActions,
  AsyncFailedAction,
  AsyncRequestedAction,
  AsyncSucceedAction,
} from './action'
import { AsyncActionStatus } from './action'
import type { AsyncStateItem } from './state'

type Reducer<
  S extends AsyncStateItem<unknown>,
  T extends string | symbol,
  As extends AsyncActions<T>,
> = (
  state: S | undefined,
  action: As['request'] | As['success'] | As['failure'],
) => S

export type AsyncActionHandler<
  S extends AsyncStateItem<unknown>,
  T extends string | symbol,
  A extends
    | AsyncRequestedAction<T>
    | AsyncSucceedAction<T>
    | AsyncFailedAction<T>,
> = (state: S, action: A) => S

export interface AsyncActionReducer<
  S extends AsyncStateItem<unknown>,
  T extends string | symbol,
  As extends AsyncActions<T>,
> {
  /**
   * Accepted action type
   */
  readonly actionType: T
  /**
   * @param state   StateItem
   * @param action  async actions for this state item
   */
  process: AsyncActionHandler<
    S,
    T,
    As['request'] | As['success'] | As['failure']
  >
}

/**
 * Create reducer of async actions
 * @param actionType
 */
export function createAsyncActionReducer<
  S extends AsyncStateItem<unknown>,
  T extends string | symbol,
  As extends AsyncActions<T>,
>(
  actionType: T,
  handlers: {
    onRequestedAction?: AsyncActionHandler<S, T, As['request']>
    onSucceedAction?: AsyncActionHandler<S, T, As['success']>
    onFailedAction?: AsyncActionHandler<S, T, As['failure']>
  } = {},
): AsyncActionReducer<S, T, As> {
  type RA = As['request']
  type SA = As['success']
  type FA = As['failure']
  type A = RA | SA | FA

  /**
   * Requested action handler
   */
  const onRequestedAction: AsyncActionHandler<S, T, RA> =
    handlers.onRequestedAction != null
      ? handlers.onRequestedAction
      : state => {
          return {
            ...state,
            loading: true,
          }
        }

  /**
   * Succeed action handler
   */
  const onSucceedAction: AsyncActionHandler<S, T, SA> =
    handlers.onSucceedAction != null
      ? handlers.onSucceedAction
      : (state, action) => {
          const { payload } = action
          return {
            ...state,
            loading: false,
            data: payload == null ? null : payload,
            error: null,
          }
        }

  /**
   * Failed action handler
   */
  const onFailedAction: AsyncActionHandler<S, T, FA> =
    handlers.onFailedAction != null
      ? handlers.onFailedAction
      : (state, action) => {
          const { payload } = action
          return {
            ...state,
            loading: false,
            error: payload == null ? null : payload,
          }
        }

  const actionReducer: AsyncActionReducer<S, T, As> = {
    actionType,
    process: function (state: S, action: A): S {
      if (action.type !== actionType) return state
      switch (action.status) {
        case AsyncActionStatus.REQUESTED:
          return onRequestedAction!(state, action)
        case AsyncActionStatus.SUCCEED:
          return onSucceedAction!(state, action)
        case AsyncActionStatus.FAILED:
          return onFailedAction!(state, action)
        default:
          return state
      }
    },
  }

  return actionReducer
}

/**
 * Create redux reducer
 *
 * @param initialState
 * @param actionReducers
 */
export function assembleActionReducers<
  S extends AsyncStateItem<unknown>,
  T extends string | symbol,
  R extends AsyncActionReducer<S, T, AsyncActions<T>> = AsyncActionReducer<
    S,
    T,
    AsyncActions<T>
  >,
>(initialState: S, actionReducers: R[]): Reducer<S, T, AsyncActions<T>> {
  type As = AsyncActions<T>
  type A = As['request'] | As['success'] | As['failure']

  return (state: S = initialState, action: A): S => {
    for (const reducer of actionReducers) {
      if (reducer.actionType === action.type) {
        return reducer.process(state, action)
      }
    }
    return state
  }
}
