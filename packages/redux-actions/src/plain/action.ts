/**
 * Data passed in redux Flow
 */
export interface Action<T extends symbol | string, P> {
  /**
   * Action type
   */
  type: T
  /**
   * Action payload
   */
  payload?: P
}
