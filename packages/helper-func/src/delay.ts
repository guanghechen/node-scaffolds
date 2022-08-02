/**
 * Create a Promise that becomes fulfilled after `duration` milliseconds.
 * @param duration (ms)
 */
export const delay = (duration: number): Promise<void> =>
  new Promise<void>(resolve => setTimeout(resolve, duration))
