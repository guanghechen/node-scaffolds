import { isNotEmptyArray, isNotEmptyObject } from '@guanghechen/helper-is'

/**
 * The strategy for merging options
 *
 * @param prevOption   previous option item
 * @param nextOption   next option item
 * @returns option item merged prevOption and nextOption
 */
export type IMergeStrategy<T = unknown> = (prevOption: T, nextOption: T | null) => T

/**
 * Default merging strategy
 */
export const defaultMergeStrategies = {
  /**
   * Replace the previous item with new one if it's neither null nor undefined,
   * otherwise, retain the previous one
   */
  replace: function (prevOption: unknown, nextOption: unknown | null): unknown {
    return nextOption == null ? prevOption : nextOption
  } as IMergeStrategy,
  /**
   * Retain the previous item and ignore the new one if the previous one is
   * neither null nor undefined, otherwise, use the new one instead
   */
  retain: function (prevOption: unknown): unknown {
    return prevOption
  } as IMergeStrategy,
  /**
   * Merge arrays, like Array.prototype.concat
   */
  concat: function (prevOption: unknown[], nextOption: unknown[] | null): unknown[] {
    if (isNotEmptyArray(nextOption)) {
      return prevOption.length > 0 ? [...prevOption, ...nextOption] : nextOption
    }
    return prevOption
  } as IMergeStrategy<unknown[]>,
  /**
   * Merge objects, like Object.prototype.assign
   */
  assign: function (
    prevOption: Record<string, unknown>,
    nextOption: Record<string, unknown> | null,
  ): Record<string, unknown> {
    if (isNotEmptyObject(nextOption)) {
      return { ...prevOption, ...nextOption }
    }
    return prevOption
  } as IMergeStrategy<Record<string, unknown>>,
}

/**
 * Merge options
 * @param options
 * @param strategies
 */
export function merge<O extends Record<string, unknown>>(
  options: O[],
  strategies: Partial<Record<keyof O, IMergeStrategy<any>>> = {},
  defaultStrategy: IMergeStrategy = defaultMergeStrategies.replace,
): O {
  const result = {} as unknown as O
  for (const option of options) {
    for (const key of Object.keys(option)) {
      const strategy: IMergeStrategy = strategies[key] || defaultStrategy
      if (result[key] != null) {
        result[key as keyof O] = strategy(result[key], option[key]) as O[keyof O]
      } else {
        result[key as keyof O] = option[key] as O[keyof O]
      }
    }
  }
  return result
}
