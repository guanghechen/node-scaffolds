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
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isFunction(v: unknown): v is Function {
  return Object.prototype.toString.call(v) === '[object Function]' || isAsyncFunction(v)
}

// Not known why typescript cannot find the `AsyncFunction` type, use Function for temporary solution.
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isAsyncFunction(v: unknown): v is Function {
  return Object.prototype.toString.call(v) === '[object AsyncFunction]'
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
export function isObject(v: unknown): v is object {
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
export function isNotEmptyObject(v: object | unknown): v is object {
  return isObject(v) && Object.getOwnPropertyNames(v).length > 0
}

/**
 * Check if the given data is an empty `Object` type.
 * @param v
 */
export function isEmptyObject(v: object | unknown): v is object {
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

/**
 * Check if the given obj is an array which all elements are of type T.
 * @param obj
 * @param check
 * @returns
 */
export const isArrayOfT = <T>(obj: unknown, check: (el: unknown) => el is T): obj is T[] => {
  return Array.isArray(obj) ? obj.every(check) : false
}

/**
 * Check if the given obj is an array which all elements are of type T[].
 * @param obj
 * @param check
 * @returns
 */
export const isTwoDimensionArrayOfT = <T>(
  obj: unknown,
  check: (el: unknown) => el is T,
): obj is T[][] => {
  return Array.isArray(obj) ? obj.every(el => isArrayOfT(el, check)) : false
}

/**
 * Check if the given obj is a Promise.
 * @param obj
 * @returns
 */
export const isPromise = (obj: unknown): obj is Promise<unknown> => {
  if (!obj) return false
  if (obj instanceof Promise) return true
  return (
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof (obj as Promise<unknown>).then === 'function'
  )
}

/**
 * Check if the given value is a plain object.
 * @param v
 * @returns
 * @see https://github.com/jonschlinkert/is-plain-object
 */
export const isPlainObject = (v: unknown): v is object => {
  if (isObject(v) === false) return false

  // If has modified constructor
  const ctor = (v as object).constructor
  if (ctor === undefined) return true

  // If has modified prototype
  const prot = ctor.prototype

  // eslint-disable-next-line no-prototype-builtins
  return isObject(prot) && prot.hasOwnProperty('isPrototypeOf')
}
