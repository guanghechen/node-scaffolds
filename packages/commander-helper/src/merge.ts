import { isNotEmptyArray, isNotEmptyObject } from '@guanghechen/option-helper'

/**
 * The strategy for merging options
 *
 * @param prevOption   previous option item
 * @param nextOption   next option item
 * @returns option item merged prevOption and nextOption
 */
export type MergeStrategy<T = unknown> = (prevOption: T, nextOption: T | null) => T

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
  } as MergeStrategy,
  /**
   * Retain the previous item and ignore the new one if the previous one is
   * neither null nor undefined, otherwise, use the new one instead
   */
  retain: function (prevOption: unknown): unknown {
    return prevOption
  } as MergeStrategy,
  /**
   * Merge arrays, like Array.prototype.concat
   */
  concat: function (prevOption: unknown[], nextOption: unknown[] | null): unknown[] {
    if (isNotEmptyArray(nextOption)) {
      return prevOption.length > 0 ? [...prevOption, ...nextOption] : nextOption
    }
    return prevOption
  } as MergeStrategy<unknown[]>,
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
  } as MergeStrategy<Record<string, unknown>>,
}

/**
 * Merge options
 * @param options
 * @param strategies
 */
export function merge<O extends Record<string, unknown>>(
  options: O[],
  strategies: Partial<Record<keyof O, MergeStrategy<any>>> = {},
  defaultStrategy: MergeStrategy = defaultMergeStrategies.replace,
): O {
  const result = {} as unknown as O
  for (const option of options) {
    for (const key of Object.keys(option)) {
      const strategy: MergeStrategy = strategies[key] || defaultStrategy
      if (result[key] != null) {
        result[key as keyof O] = strategy(result[key], option[key]) as O[keyof O]
      } else {
        result[key as keyof O] = option[key] as O[keyof O]
      }
    }
  }
  return result
}
