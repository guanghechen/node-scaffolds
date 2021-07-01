/**
 * Create a Promise that becomes fulfilled after `timeout` milliseconds
 * @param timeout  (ms)
 */
export function delay(timeout: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, timeout))
}

/**
 * Do nothing
 * @param args
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function noop(...args: any[]): void {}
