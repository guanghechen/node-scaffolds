import { isFunction } from '@guanghechen/is'
import { convertToBoolean, convertToInteger, convertToNumber, convertToString } from './convert'

/**
 * Cover a defaultValue if the given value is not null / undefined.
 * @param defaultValue
 * @param value
 */
export function cover<T>(
  defaultValue: T | (() => T),
  value?: T | null,
  isValid?: (value: T) => boolean,
): T {
  if (value != null && (isValid == null || isValid(value))) return value
  return isFunction(defaultValue) ? defaultValue() : defaultValue
}

/**
 * Cover the defaultValue with a value converted to a boolean type.
 * @param defaultValue
 * @param value
 */
export function coverBoolean(
  defaultValue: boolean,
  value?: unknown,
  isValid?: (value: boolean) => boolean,
): boolean {
  const resolvedValue = convertToBoolean(value)
  return cover(defaultValue, resolvedValue, isValid)
}

/**
 * Cover the defaultValue with a value converted to a number type.
 * @param defaultValue
 * @param value
 */
export function coverNumber(
  defaultValue: number,
  value?: unknown,
  isValid?: (value: number) => boolean,
): number {
  const resolvedValue = convertToNumber(value)
  return cover(defaultValue, resolvedValue, isValid)
}

/**
 * Cover the defaultValue with a value converted to a integer type.
 * @param defaultValue
 * @param value
 */
export function coverInteger(
  defaultValue: number,
  value?: unknown,
  isValid?: (value: number) => boolean,
): number {
  const resolvedValue = convertToInteger(value)
  return cover(defaultValue, resolvedValue, isValid)
}

/**
 * Cover the defaultValue with a value converted to a string type.
 * @param defaultValue
 * @param value
 */
export function coverString<T extends string = string>(
  defaultValue: T,
  value?: unknown,
  isValid?: (value: T) => boolean,
): T {
  const resolvedValue = convertToString(value) as T
  return cover<T>(defaultValue, resolvedValue, isValid)
}
