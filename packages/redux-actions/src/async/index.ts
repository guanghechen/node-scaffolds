import type { AsyncActions } from './action'
import type { AsyncActionCreators } from './creator'
import { createAsyncActionCreator } from './creator'
import type { AsyncActionHandler, AsyncActionReducer } from './reducer'
import { createAsyncActionReducer } from './reducer'
import type { AsyncStateItem } from './state'

export * from './action'
export * from './creator'
export * from './reducer'
export * from './state'

/**
 * Shorthand for create both AsyncActionCreator and AsyncActionReducer
 * @param actionType
 * @param handlers
 */
export function createAsyncAction<
  S extends AsyncStateItem<unknown>,
  T extends string | symbol,
  As extends AsyncActions<T>,
>(
  actionType: T,
  handlers?: {
    onRequestedAction?: AsyncActionHandler<S, T, As['request']>
    onSucceedAction?: AsyncActionHandler<S, T, As['success']>
    onFailedAction?: AsyncActionHandler<S, T, As['failure']>
  },
): {
  creator: AsyncActionCreators<T, As>
  reducer: AsyncActionReducer<S, T, As>
} {
  const creator = createAsyncActionCreator<T, As>(actionType)
  const reducer = createAsyncActionReducer<S, T, As>(actionType, handlers)
  return { creator, reducer }
}
