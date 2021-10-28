import type { Action } from '../plain/action'

/**
 * Status of async action
 */
export enum AsyncActionStatus {
  /**
   * Requested
   */
  REQUESTED = 'REQUESTED',
  /**
   * Request succeed
   */
  SUCCEED = 'SUCCEED',
  /**
   * Request failed
   */
  FAILED = 'FAILED',
}

/**
 * Response of failed request
 */
export interface AsyncFailureResponse {
  /**
   * Error code
   */
  code: number
  /**
   * Error message
   */
  message: string
  /**
   * Debugging information
   */
  debug?: string
}

/**
 * Async action passed in redux Flow
 */
export interface AsyncAction<
  T extends symbol | string,
  P,
  S extends AsyncActionStatus,
> extends Action<T, P> {
  /**
   * Action type
   */
  type: T
  /**
   * Status of request of async action
   */
  status: S
  /**
   * Action payload
   */
  payload?: P
}

/**
 * Requested action
 */
export type AsyncRequestedAction<
  T extends string | symbol,
  P = unknown,
> = AsyncAction<T, P, AsyncActionStatus.REQUESTED>

/**
 * Request succeed action
 */
export type AsyncSucceedAction<
  T extends string | symbol,
  P = unknown,
> = Required<AsyncAction<T, P, AsyncActionStatus.SUCCEED>>

/**
 * Request failed action
 */
export type AsyncFailedAction<
  T extends string | symbol,
  P extends AsyncFailureResponse = AsyncFailureResponse,
> = Required<AsyncAction<T, P, AsyncActionStatus.FAILED>>

/**
 * Async actions
 */
export interface AsyncActions<
  T extends string | symbol,
  RP = unknown,
  SP = unknown,
  FP extends AsyncFailureResponse = AsyncFailureResponse,
> {
  request: AsyncRequestedAction<T, RP> // Requested action
  success: AsyncSucceedAction<T, SP> // Succeed action
  failure: AsyncFailedAction<T, FP> // Failed action
}
