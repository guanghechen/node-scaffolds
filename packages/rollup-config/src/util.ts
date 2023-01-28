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
 * @param v
 */
export function convertToBoolean(v?: unknown): boolean | null {
  if (v == null) return null
  if (typeof v === 'string') {
    switch (v.toLowerCase()) {
      case 'false':
        return false
      case 'true':
        return true
      default:
        return null
    }
  }
  return typeof v === 'boolean' ? v : null
}

/**
 * Check if the given data is a `Array` type.
 * @param v
 */
export function isArray(v: unknown[] | unknown): v is unknown[] {
  return Object.prototype.toString.call(v) === '[object Array]'
}
