/**
 * Check if the given data is a `Array` type.
 * @param v
 */
export function isArray(v: unknown[] | unknown): v is unknown[] {
  return Object.prototype.toString.call(v) === '[object Array]'
}

/**
 * Check if the given data is a `bigint` type.
 * @param v
 */
export function isBigint(v: symbol | unknown): v is bigint {
  return typeof v === 'bigint'
}

/**
 * Check if the given data is a `boolean` / `Boolean` type.
 * @param v
 */
export function isBoolean(v: boolean | unknown): v is boolean {
  return Object.prototype.toString.call(v) === '[object Boolean]'
}

/**
 * Checks whether the given value is an object of type Date.
 * @param value
 */
export const isDate = (value: unknown): value is Date => {
  return Object.prototype.toString.call(value) === '[object Date]'
}

/**
 * Check if the given data is a `Function` type.
 * @param v
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(v: unknown): v is Function {
  return Object.prototype.toString.call(v) === '[object Function]'
}

/**
 * Check if the given data is a `Integer` type.
 * @param v
 */
export function isInteger(v: number | unknown): v is number {
  return isNumber(v) && Number.isInteger(Number(v))
}

/**
 * Check if the given data is a `number` / `Number` type.
 * @param v
 */
export function isNumber(v: number | unknown): v is number {
  return Object.prototype.toString.call(v) === '[object Number]'
}

/**
 * Check if the given data is a `Object` type.
 * @param v
 */
export function isObject(v: unknown): v is Record<string, unknown> {
  return Object.prototype.toString.call(v) === '[object Object]'
}

/**
 * Check if the given data is a `string` / `String` type.
 * @param v
 */
export function isString(v: string | unknown): v is string {
  return Object.prototype.toString.call(v) === '[object String]'
}

/**
 * Check if the given data is a `symbol` type.
 * @param v
 */
export function isSymbol(v: symbol | unknown): v is symbol {
  return typeof v === 'symbol'
}

/**
 * Check if the given data is a `undefined` type.
 * @param v
 */
export function isUndefined(v: boolean | unknown): v is undefined {
  return typeof v === 'undefined'
}

/**
 * Check if the given data is a `boolean` type.
 * @param x
 */
export function isPrimitiveBoolean(x: boolean | unknown): x is boolean {
  return typeof x === 'boolean'
}

/**
 * Check if the given data is a `integer` type.
 * @param v
 */
export function isPrimitiveInteger(v: number | unknown): v is number {
  return isPrimitiveNumber(v) && Number.isInteger(v)
}

/**
 * Check if the given data is a `number` type.
 * @param x
 */
export function isPrimitiveNumber(x: number | unknown): x is number {
  return typeof x === 'number'
}

/**
 * Check if the given data is a `string` type.
 * @param x
 */
export function isPrimitiveString(x: string | unknown): x is string {
  return typeof x === 'string'
}

/**
 * Check if the given data is an non-blank `string` / `String` type.
 * @param v
 */
export function isNonBlankString(v: string | unknown): v is string {
  return isString(v) && v.length > 0
}

/**
 * Check if the given data is an not-empty `Array` type.
 * @param v
 */
export function isNotEmptyArray(v: unknown[] | unknown): v is unknown[] {
  return isArray(v) && v.length > 0
}

/**
 * Check if the given data is an not-empty `Object` type.
 * @param v
 */
export function isNotEmptyObject(
  v: Record<string, unknown> | unknown,
): v is Record<string, unknown> {
  return isObject(v) && Object.getOwnPropertyNames(v).length > 0
}

/**
 * Check if the given data is an empty `Object` type.
 * @param v
 */
export function isEmptyObject(v: Record<string, unknown> | unknown): v is Record<string, unknown> {
  return isObject(v) && Object.getOwnPropertyNames(v).length <= 0
}

/**
 * Check if the given data is an `number` / `Number` or number like `string` type.
 * @param v
 */
export function isNumberLike(v: number | string | unknown): v is number | string {
  if (isNumber(v)) return true
  return isNonBlankString(v) && !Number.isNaN(Number(v))
}
