import { convertToBoolean, convertToNumber, convertToString } from './convert'

/**
 * Cover a defaultValue if the given value is not null / undefined.
 * @param defaultValue
 * @param value
 */
export function cover<T>(defaultValue: T, value?: T | null): T {
  return value == null ? defaultValue : value
}

/**
 * Cover the defaultValue with a value converted to a boolean type.
 * @param defaultValue
 * @param value
 */
export function coverBoolean(defaultValue: boolean, value?: unknown): boolean {
  const resolvedValue = convertToBoolean(value)
  return cover(defaultValue, resolvedValue)
}

/**
 * Cover the defaultValue with a value converted to a boolean type.
 * @param defaultValue
 * @param value
 */
export function coverNumber(defaultValue: number, value?: unknown): number {
  const resolvedValue = convertToNumber(value)
  return cover(defaultValue, resolvedValue)
}

/**
 * Cover the defaultValue with a value converted to a boolean type.
 * @param defaultValue
 * @param value
 */
export function coverString(defaultValue: string, value?: unknown): string {
  const resolvedValue = convertToString(value)
  return cover(defaultValue, resolvedValue)
}
