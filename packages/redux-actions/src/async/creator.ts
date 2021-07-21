import type { AsyncActions } from './action'
import { AsyncActionStatus } from './action'

/**
 * Creators of async actions
 */
export interface AsyncActionCreators<
  T extends string | symbol,
  As extends AsyncActions<T>,
> {
  /**
   * Requested action creator
   */
  request(payload?: As['request']['payload']): As['request']
  /**
   * Succeed action creator
   */
  success(payload: As['success']['payload']): As['success']
  /**
   * Failed action creator
   */
  failure(payload: As['failure']['payload']): As['failure']
}

/**
 * Create async action types and async action creators
 *
 * @param actionType
 */
export function createAsyncActionCreator<
  T extends string | symbol,
  As extends AsyncActions<T>,
>(actionType: T): AsyncActionCreators<T, As> {
  type RA = As['request']
  type SA = As['success']
  type FA = As['failure']

  /**
   * Requested action creator
   */
  const createRequestAction = (payload?: RA['payload']): RA => {
    return { type: actionType, status: AsyncActionStatus.REQUESTED, payload }
  }

  /**
   * Succeed action creator
   */
  const createSuccessAction = (payload: SA['payload']): SA => {
    return { type: actionType, status: AsyncActionStatus.SUCCEED, payload }
  }

  /**
   * Failure action creator
   */
  const createFailureAction = (payload: FA['payload']): FA => {
    return { type: actionType, status: AsyncActionStatus.FAILED, payload }
  }

  // Action creators
  const ActionCreators = {
    request: createRequestAction,
    success: createSuccessAction,
    failure: createFailureAction,
  }

  return ActionCreators
}
