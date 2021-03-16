/**
 * No operation performed.
 * @param data
 * @returns
 */
export function noop<T extends unknown = unknown>(
  data?: T,
): T extends undefined ? never : T {
  return data as any
}

/**
 * Return a promise resolved after {duration} ms.
 * @param duration The waiting time. (ms)
 * @returns
 */
export function sleep(duration: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, duration)
  })
}
