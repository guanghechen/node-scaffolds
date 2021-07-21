/**
 * Data passed in redux Flow
 */
export interface Action<T extends symbol | string, P extends unknown> {
  /**
   * Action type
   */
  type: T
  /**
   * Action payload
   */
  payload?: P
}
