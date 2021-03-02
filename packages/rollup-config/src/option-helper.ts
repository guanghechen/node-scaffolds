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
 * Convert a given value to boolean type.
 * @param value
 */
export function convertToBoolean(value?: unknown): boolean | null {
  if (value == null) return null
  if (typeof value === 'string') {
    switch (value.toLowerCase()) {
      case 'false':
        return false
      case 'true':
        return true
      default:
        return null
    }
  }
  return Boolean(value)
}
