import { isBoolean, isNumber, isString } from './is'

/**
 * Convert a given value to boolean type.
 *
 *  * Boolean type
 *
 *    - true ==> true
 *    - false ==> false
 *
 *  * String type
 *
 *    - "true" ==> true
 *    - "TrUe" ==> true
 *    - "FALSE" ==> false
 *    - "false" ==> false
 *    - "xfef" ==> null
 *    - "1232" ==> null
 *
 *  * Other type ==> null
 * @param v
 */
export function convertToBoolean(v?: unknown): boolean | null {
  if (v == null) return null
  if (isString(v)) {
    switch (v.toLowerCase()) {
      case 'false':
        return false
      case 'true':
        return true
      default:
        return null
    }
  }
  return isBoolean(v) ? v : null
}

/**
 * Convert a given value to number type.
 *
 *  * Number type
 *
 *    - 123 ==> 123
 *    - -132132.23 ==> -132132.23
 *
 *  * String type
 *
 *    - "12323" ==> 12323
 *    - "x232y" ==> null
 *    - "     " ==> null
 *
 *  * Other type ==> null
 * @param v
 */
export function convertToNumber(v?: unknown): number | null {
  if (v == null) return null
  if (isString(v)) {
    if (/^\s*$/.test(v)) return null
    const x = Number(v)
    return Number.isNaN(x) ? null : x
  }
  return isNumber(v) ? v : null
}

/**
 * Convert to string.
 *
 *  * String / Number / Boolean type ==> x.toString()
 *
 *  * Other type ==> null
 * @param v
 */
export function convertToString(v?: unknown): string | null {
  if (v == null) return null
  if (isString(v) || isNumber(v) || isBoolean(v)) {
    return v.toString()
  }
  return null
}
