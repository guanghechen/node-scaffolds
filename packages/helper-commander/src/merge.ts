/**
 * The strategy for merging options.
 *
 * @param prevValue   previous option value.
 * @param nextValue   next option value.
 * @returns option item merged prevOption and nextOption
 */
export type IMergeStrategy<T = unknown> = (prevValue: T, nextValue: T | null) => T

/**
 * Merge options
 * @param options
 * @param strategies
 */
export function merge<O extends Record<string, unknown>>(
  options: O[],
  strategies: Partial<Record<keyof O, IMergeStrategy<O[keyof O]>>> = {},
  defaultStrategy: IMergeStrategy = (prevOptions, nextOptions) => nextOptions ?? prevOptions,
): O {
  const result = {} as unknown as O
  for (const option of options) {
    for (const key of Object.keys(option)) {
      const strategy = (strategies[key] || defaultStrategy) as IMergeStrategy
      const value: O[keyof O] =
        result[key] === undefined
          ? (option[key] as O[keyof O])
          : (strategy(result[key], option[key]) as O[keyof O])
      result[key as keyof O] = value
    }
  }
  return result
}
