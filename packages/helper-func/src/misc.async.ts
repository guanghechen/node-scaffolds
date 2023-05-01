export const falsyAsync = (..._args: any[]): Promise<boolean> => Promise.resolve(false)
export const truthyAsync = (..._args: any[]): Promise<boolean> => Promise.resolve(true)
export const identityAsync = <T>(data: T | Promise<T>): Promise<T> => Promise.resolve(data)
export const noopAsync = (..._args: any[]): Promise<void> => Promise.resolve()

/**
 * Create a Promise that becomes fulfilled after `duration` milliseconds.
 * @param duration (ms)
 */
export const delay = (duration: number): Promise<void> =>
  new Promise<void>(resolve => setTimeout(resolve, duration))
