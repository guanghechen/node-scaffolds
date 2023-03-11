import { isBoolean, isNumber, isString } from '@guanghechen/helper-is'

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
export const convertToBoolean = (v?: unknown): boolean | null => {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') {
    const t = v.toLowerCase()
    if (t === 'false') return false
    if (t === 'true') return true
  }
  return null
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
 *    - "12323"     ==> 12323
 *    - "x232y"     ==> null
 *    - "     "     ==> null
 *
 *  * Other type    ==> null
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
 * Convert a given value to integer type.
 *
 *  * Number type
 *
 *    - 123         ==> 123
 *    - 132132.23   ==> 132132
 *    - -132132.23  ==> -132132
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
export function convertToInteger(v?: unknown): number | null {
  const v2 = convertToNumber(v)
  return v2 == null ? null : Math.trunc(v2)
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
