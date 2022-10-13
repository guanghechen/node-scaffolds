/**
 * The strategy for merging options.
 *
 * @param prevValue   previous option value.
 * @param nextValue   next option value.
 * @returns option item merged prevOption and nextOption
 */
export type IMergeStrategy<T = unknown> = (prevValue: T, nextValue: T | null) => T

export type IMergeStrategyMap<O extends object> = {
  [K in keyof O]: IMergeStrategy<O[K]>
}

/**
 * Merge options
 *
 * @param options
 * @param strategyMap
 * @param defaultStrategy
 */
export function merge<O extends object>(
  options: O[],
  strategyMap: Partial<IMergeStrategyMap<O>> = {},
  defaultStrategy: IMergeStrategy = (prevOptions, nextOptions) => nextOptions ?? prevOptions,
): O {
  const result: O = { ...options[0] }
  for (let i = 1; i < options.length; ++i) {
    const option = options[i]
    for (const key of Object.keys(option)) {
      const strategy = strategyMap[key] || defaultStrategy
      const nextValue = strategy(result[key], option[key])
      result[key] = nextValue
    }
  }
  return result
}
