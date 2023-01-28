/* eslint-disable no-new-func */
/* eslint-disable no-new-object */
/* eslint-disable no-new-wrappers */
import {
  isArray,
  isArrayOfT,
  isBigint,
  isBoolean,
  isDate,
  isEmptyObject,
  isFunction,
  isInteger,
  isNonBlankString,
  isNotEmptyArray,
  isNotEmptyObject,
  isNumber,
  isNumberLike,
  isObject,
  isPlainObject,
  isPrimitiveBoolean,
  isPrimitiveInteger,
  isPrimitiveNumber,
  isPrimitiveString,
  isPromise,
  isString,
  isSymbol,
  isTwoDimensionArrayOfT,
  isUndefined,
} from '../src'

describe('is', () => {
  describe('isUndefined', () => {
    test('`undefined` is undefined', () => expect(isUndefined(undefined)).toBe(true))
    test('`null` is not undefined', () => expect(isUndefined(null)).toBe(false))
    test('`false` is not undefined', () => expect(isUndefined(false)).toBe(false))
    test('`0` is not undefined', () => expect(isUndefined(0)).toBe(false))
    test('empty string is not undefined', () => expect(isUndefined('')).toBe(false))
    test('empty array is not undefined', () => expect(isUndefined([])).toBe(false))
    test('empty object is not undefined', () => expect(isUndefined({})).toBe(false))
  })

  describe('isBoolean', () => {
    test('`false` is a boolean type', () => expect(isBoolean(false)).toBe(true))
    test('`true` is a boolean type', () => expect(isBoolean(true)).toBe(true))
    test('`new Boolean(undefined)` is a boolean type', () =>
      expect(isBoolean(new Boolean(undefined))).toBe(true))
    test('`new Boolean(null)` is a boolean type', () =>
      expect(isBoolean(new Boolean(null))).toBe(true))
    test('`new Boolean(1)` is a boolean type', () => expect(isBoolean(new Boolean(1))).toBe(true))
    test("`new Boolean('')` is a boolean type", () => expect(isBoolean(new Boolean(''))).toBe(true))
    test('`undefined` is not a boolean type', () => expect(isBoolean(undefined)).toBe(false))
    test('`null` is not a boolean type', () => expect(isBoolean(null)).toBe(false))
    test('empty string is not a boolean type', () => expect(isBoolean('')).toBe(false))
    test('empty array is not a boolean type', () => expect(isBoolean([])).toBe(false))
    test('empty object is not a boolean type', () => expect(isBoolean({})).toBe(false))
  })

  describe('isDate', () => {
    test('Instance of Date is a date', () => expect(isDate(new Date())).toBe(true))
    test('Date string is not a date', () => expect(isDate('2021-04-03T07:49:56.260Z')).toBe(false))
    test('null is not a date', () => expect(isDate(null)).toBe(false))
    test('undefined is not a date', () => expect(isDate(undefined)).toBe(false))
  })

  describe('isNumber', () => {
    test('`0` is a number', () => expect(isNumber(0)).toBe(true))
    test('`1` is a number', () => expect(isNumber(1)).toBe(true))
    test('`-1` is a number', () => expect(isNumber(-1)).toBe(true))
    test('`-1.0234` is a number', () => expect(isNumber(-1.0234)).toBe(true))
    test("new Number(`'1')` is a number", () => expect(isNumber(new Number('-1'))).toBe(true))
    test("`'1'` is not a number", () => expect(isNumber('1')).toBe(false))
    test('`undefined` is not a number', () => expect(isNumber(undefined)).toBe(false))
    test('`null` is not a number', () => expect(isNumber(null)).toBe(false))
    test('empty string is not a number', () => expect(isNumber('')).toBe(false))
    test('empty array is not a number', () => expect(isNumber([])).toBe(false))
    test('empty object is not a number', () => expect(isNumber({})).toBe(false))
    test('bigint is not a number', () => expect(isNumber(BigInt(233))).toBe(false))
  })

  describe('isString', () => {
    test("`'x'` is a string", () => expect(isString('x')).toBe(true))
    test('`new String(1)` is a string', () => expect(isString(new String(1))).toBe(true))
    test('`undefined` is not a string', () => expect(isString(undefined)).toBe(false))
    test('`null` is not a string', () => expect(isString(null)).toBe(false))
    test('empty string is a string', () => expect(isString('')).toBe(true))
    test('empty array is not a string', () => expect(isString([])).toBe(false))
    test('empty object is not a string', () => expect(isString({})).toBe(false))
  })

  describe('isBigint', () => {
    test('`BigInt(0)` is a bigint', () => expect(isBigint(BigInt(0))).toBe(true))
    test('`0` is not a bigint', () => expect(isBigint(0)).toBe(false))
    test('`undefined` is not a bigint', () => expect(isBigint(undefined)).toBe(false))
    test('`null` is not a bigint', () => expect(isBigint(null)).toBe(false))
    test('empty string is not a bigint', () => expect(isBigint('')).toBe(false))
    test('empty array is not a bigint', () => expect(isBigint([])).toBe(false))
    test('empty object is not a bigint', () => expect(isBigint({})).toBe(false))
  })

  describe('isSymbol', () => {
    test("`Symbol('x')` is a symbol", () => expect(isSymbol(Symbol('x'))).toBe(true))
    test("`Symbol.for('x')` is a symbol", () => expect(isSymbol(Symbol.for('x'))).toBe(true))
    test('`undefined` is not a symbol', () => expect(isSymbol(undefined)).toBe(false))
    test('`null` is not a symbol', () => expect(isSymbol(null)).toBe(false))
    test('literal string is not a symbol', () => expect(isSymbol('x')).toBe(false))
    test('empty array is not a symbol', () => expect(isSymbol([])).toBe(false))
    test('empty object is not a symbol', () => expect(isSymbol({})).toBe(false))
  })

  describe('isInteger', () => {
    test('`-1` is a integer', () => expect(isInteger(-1)).toBe(true))
    test("new Number(`'1')` is a integer", () => expect(isInteger(new Number('-1'))).toBe(true))
    test('`1.000` is not a integer', () => expect(isInteger(1.0)).toBe(true))
    test('`1.002` is not a integer', () => expect(isInteger(1.002)).toBe(false))
    test('`undefined` is not a integer', () => expect(isInteger(undefined)).toBe(false))
    test('`null` is not a integer', () => expect(isInteger(null)).toBe(false))
    test('literal string is not a integer', () => expect(isInteger('x')).toBe(false))
    test('empty array is not a integer', () => expect(isInteger([])).toBe(false))
    test('empty object is not a integer', () => expect(isInteger({})).toBe(false))
    test('bigint is not a integer', () => expect(isInteger(BigInt(1))).toBe(false))
  })

  describe('isArray', () => {
    test('`new Array(3)` is an array', () => expect(isArray(new Array(3))).toBe(true))
    test("`[1, 2, 'x']` is an array", () => expect(isArray([1, 2, 'x'])).toBe(true))
    test('`undefined` is not an array', () => expect(isArray(undefined)).toBe(false))
    test('`null` is not an array', () => expect(isArray(null)).toBe(false))
    test('string is not an array', () => expect(isArray('x')).toBe(false))
    test('empty object is not an array', () => expect(isArray({})).toBe(false))
    test('empty array is an array', () => expect(isArray([])).toBe(true))
    test('array like object is not an array', () => expect(isArray({ 1: 'waw' })).toBe(false))
  })

  describe('isObject', () => {
    test('`new Object()` is an object', () => expect(isObject(new Object())).toBe(true))
    test('array like object is an object', () => expect(isObject({ 1: 'waw' })).toBe(true))
    test('empty object is an object', () => expect(isObject({})).toBe(true))
    test('function is not an object', () =>
      expect(isObject(new Function("console.log('waw')"))).toBe(false))
    test('`undefined` is not an object', () => expect(isObject(undefined)).toBe(false))
    test('`null` is not an object', () => expect(isObject(null)).toBe(false))
  })

  describe('isFunction', () => {
    test('lambda expressions is a function', () => expect(isFunction(() => {})).toBe(true))
    test('anonymous function is a function', () => expect(isFunction(() => {})).toBe(true))
    test('instance of Function is a function', () =>
      expect(isFunction(new Function("console.log('waw')"))).toBe(true))
    test('async function', () => expect(isFunction(async () => {})).toBe(true))
    test('anonymous async function', () => expect(isFunction(async () => {})).toBe(true))
    test('empty object is not a function', () => expect(isFunction({})).toBe(false))
    test('function string is not a function', () =>
      expect(isFunction("function f () {console.log('waw')}")).toBe(false))
    test('`undefined` is not a function', () => expect(isFunction(undefined)).toBe(false))
    test('`null` is not a function', () => expect(isFunction(null)).toBe(false))
  })

  describe('isPrimitiveBoolean', () => {
    test('`false` is a primitive boolean', () => expect(isPrimitiveBoolean(false)).toBe(true))
    test('`true` is a primitive boolean', () => expect(isPrimitiveBoolean(true)).toBe(true))
    test('`new Boolean(false)` is not a primitive boolean type', () =>
      expect(isPrimitiveBoolean(new Boolean(false))).toBe(false))
    test('`new Boolean(true)` is not a primitive boolean type', () =>
      expect(isPrimitiveBoolean(new Boolean(true))).toBe(false))
    test('`undefined` is not a primitive boolean', () =>
      expect(isPrimitiveBoolean(undefined)).toBe(false))
    test('`null` is not a primitive boolean', () => expect(isPrimitiveBoolean(null)).toBe(false))
  })

  describe('isPrimitiveNumber', () => {
    test('`0` is a primitive number', () => expect(isPrimitiveNumber(0)).toBe(true))
    test('`1` is a primitive number', () => expect(isPrimitiveNumber(1)).toBe(true))
    test('`-1` is a primitive number', () => expect(isPrimitiveNumber(-1)).toBe(true))
    test('`-1.0234` is a primitive number', () => expect(isPrimitiveNumber(-1.0234)).toBe(true))
    test("new Number(`'1')` is not a primitive number", () =>
      expect(isPrimitiveNumber(new Number('-1'))).toBe(false))
    test("`'1'` is not a primitive number", () => expect(isPrimitiveNumber('1')).toBe(false))
    test('`undefined` is not a primitive number', () =>
      expect(isPrimitiveNumber(undefined)).toBe(false))
    test('`null` is not a primitive number', () => expect(isPrimitiveNumber(null)).toBe(false))
    test('empty string is not a primitive number', () => expect(isPrimitiveNumber('')).toBe(false))
    test('empty array is not a primitive number', () => expect(isPrimitiveNumber([])).toBe(false))
    test('empty object is not a primitive number', () => expect(isPrimitiveNumber({})).toBe(false))
    test('bigint is not a primitive number', () =>
      expect(isPrimitiveNumber(BigInt(233))).toBe(false))
  })

  describe('isPrimitiveInteger', () => {
    test('`-1` is a primitive integer', () => expect(isPrimitiveInteger(-1)).toBe(true))
    test('new Number(`1`) is not a primitive integer', () =>
      expect(isPrimitiveInteger(new Number(1))).toBe(false))
    test('`1.000` is not a primitive integer', () => expect(isPrimitiveInteger(1.0)).toBe(true))
    test('`1.002` is not a primitive integer', () => expect(isPrimitiveInteger(1.002)).toBe(false))
    test('`undefined` is not a primitive integer', () =>
      expect(isPrimitiveInteger(undefined)).toBe(false))
    test('`null` is not a primitive integer', () => expect(isPrimitiveInteger(null)).toBe(false))
    test('literal string is not a primitive integer', () =>
      expect(isPrimitiveInteger('x')).toBe(false))
    test('empty array is not a primitive integer', () => expect(isPrimitiveInteger([])).toBe(false))
    test('empty object is not a primitive integer', () =>
      expect(isPrimitiveInteger({})).toBe(false))
    test('bigint is not a primitive integer', () =>
      expect(isPrimitiveInteger(BigInt(1))).toBe(false))
  })

  describe('isPrimitiveString', () => {
    test("`'x'` is a primitive string", () => expect(isPrimitiveString('x')).toBe(true))
    test("`new String('x')` is not a primitive string", () =>
      expect(isPrimitiveString(new String('x'))).toBe(false))
    test('`undefined` is not a primitive string', () =>
      expect(isPrimitiveString(undefined)).toBe(false))
    test('`null` is not a primitive string', () => expect(isPrimitiveString(null)).toBe(false))
    test('primitive empty string is a primitive string', () =>
      expect(isPrimitiveString('')).toBe(true))
    test('empty array is not a primitive string', () => expect(isPrimitiveString([])).toBe(false))
    test('empty object is not a primitive string', () => expect(isPrimitiveString({})).toBe(false))
  })

  describe('isNotEmptyString', () => {
    test("`'x'` is a non-empty string", () => expect(isNonBlankString('x')).toBe(true))
    test("`''` is not a non-empty string", () => expect(isNonBlankString('')).toBe(false))
    test("`new String('x')` is a non-empty string", () =>
      expect(isNonBlankString(new String('x'))).toBe(true))
    test('`undefined` is not a non-empty string', () =>
      expect(isNonBlankString(undefined)).toBe(false))
    test('`null` is not a non-empty string', () => expect(isNonBlankString(null)).toBe(false))
    test('empty string is not a non-empty string', () => expect(isNonBlankString('')).toBe(false))
    test('empty array is not a non-empty string', () => expect(isNonBlankString([])).toBe(false))
    test('empty object is not a non-empty string', () => expect(isNonBlankString({})).toBe(false))
  })

  describe('isNotEmptyArray', () => {
    test('`new Array(3)` is a non-empty array', () =>
      expect(isNotEmptyArray(new Array(3))).toBe(true))
    test("`[1, 2, 'x']` is a non-empty array", () =>
      expect(isNotEmptyArray([1, 2, 'x'])).toBe(true))
    test('`undefined` is not a non-empty array', () =>
      expect(isNotEmptyArray(undefined)).toBe(false))
    test('`null` is not a non-empty array', () => expect(isNotEmptyArray(null)).toBe(false))
    test('string is not a non-empty array', () => expect(isNotEmptyArray('x')).toBe(false))
    test('empty object is not a non-empty array', () => expect(isNotEmptyArray({})).toBe(false))
    test('empty array is not a non-empty array', () => expect(isNotEmptyArray([])).toBe(false))
    test('non-empty array like object is not a non-empty array', () =>
      expect(isNotEmptyArray({ 1: 'waw' })).toBe(false))
  })

  describe('isEmptyObject', () => {
    test('`new Object()` is an empty object', () => expect(isEmptyObject(new Object())).toBe(true))
    test('`new Object({ x: 1 })` is not an empty object', () =>
      expect(isEmptyObject(new Object({ x: 1 }))).toBe(false))
    test('empty object is an empty object', () => expect(isEmptyObject({})).toBe(true))
    test('function is not an empty object', () =>
      expect(isEmptyObject(new Function("console.log('waw')"))).toBe(false))
    test('`undefined` is not an empty object', () => expect(isEmptyObject(undefined)).toBe(false))
    test('`null` is not an empty object', () => expect(isEmptyObject(null)).toBe(false))
  })

  describe('isNotEmptyObject', () => {
    test('`new Object()` is a non-empty object', () =>
      expect(isNotEmptyObject(new Object())).toBe(false))
    test('`new Object({ x: 1 })` is a non-empty object', () =>
      expect(isNotEmptyObject(new Object({ x: 1 }))).toBe(true))
    test('array like object is a non-empty object', () =>
      expect(isNotEmptyObject({ 1: 'waw' })).toBe(true))
    test('empty object is not a non-empty object', () => expect(isNotEmptyObject({})).toBe(false))
    test('function is not a non-empty object', () =>
      expect(isNotEmptyObject(new Function("console.log('waw')"))).toBe(false))
    test('`undefined` is not a non-empty object', () =>
      expect(isNotEmptyObject(undefined)).toBe(false))
    test('`null` is not a non-empty object', () => expect(isNotEmptyObject(null)).toBe(false))
  })

  describe('isNumberLike', () => {
    test('`0` is a number like', () => expect(isNumberLike(0)).toBe(true))
    test('`1` is a number like', () => expect(isNumberLike(1)).toBe(true))
    test('`-1` is a number like', () => expect(isNumberLike(-1)).toBe(true))
    test('`-1.0234` is a number like', () => expect(isNumberLike(-1.0234)).toBe(true))
    test("new Number(`'1')` is a number like", () =>
      expect(isNumberLike(new Number('-1'))).toBe(true))
    test("`'1'` is a number like", () => expect(isNumberLike('1')).toBe(true))
    test("`'1x'` is a number like", () => expect(isNumberLike('1x')).toBe(false))
    test('`undefined` is not a number like', () => expect(isNumberLike(undefined)).toBe(false))
    test('`null` is not a number like', () => expect(isNumberLike(null)).toBe(false))
    test('empty string is not a number like', () => expect(isNumberLike('')).toBe(false))
    test('empty array is not a number like', () => expect(isNumberLike([])).toBe(false))
    test('empty object is not a number like', () => expect(isNumberLike({})).toBe(false))
    test('bigint is not a number like', () => expect(isNumberLike(BigInt(233))).toBe(false))
  })

  describe('isArrayOfT', () => {
    test('string[], isString', () => expect(isArrayOfT(['a', 'b'], isString)).toBe(true))
    test('string[], isNumber', () => expect(isArrayOfT(['a', 'b'], isNumber)).toBe(false))
    test('(string|number)[], isString', () =>
      expect(isArrayOfT(['a', 'b', 2], isString)).toBe(false))
    test('(string|null)[], isString', () =>
      expect(isArrayOfT(['a', 'b', null], isString)).toBe(false))
    test('(string|undefined)[], isString', () =>
      expect(isArrayOfT(['a', 'b', undefined], isString)).toBe(false))
    test('string, isString', () => expect(isArrayOfT('a', isString)).toBe(false))
    test('number, isString', () => expect(isArrayOfT(1, isString)).toBe(false))
    test('null, isString', () => expect(isArrayOfT(null, isString)).toBe(false))
    test('undefined, isString', () => expect(isArrayOfT(undefined, isString)).toBe(false))
  })

  describe('isTwoDimensionArrayOfT', () => {
    test('string[][], isString', () =>
      expect(isTwoDimensionArrayOfT([['a', 'b'], ['b']], isString)).toBe(true))
    test('string[], isString', () =>
      expect(isTwoDimensionArrayOfT(['a', 'b'], isString)).toBe(false))
    test('(string|null)[][], isString', () =>
      expect(
        isTwoDimensionArrayOfT(
          [
            ['a', 'b'],
            ['b', null],
          ],
          isString,
        ),
      ).toBe(false))
    test('(string|undefined)[][], isString', () =>
      expect(isTwoDimensionArrayOfT([['a', 'b', undefined, 'c'], ['b']], isString)).toBe(false))
    test('(string[]|unknown)[], isString', () =>
      expect(isTwoDimensionArrayOfT([['a', 'b'], ['b'], 'c'], isString)).toBe(false))
    test('string, isString', () => expect(isTwoDimensionArrayOfT('c', isString)).toBe(false))
  })

  describe('isPromise', () => {
    test('isPromise', () => {
      expect(isPromise(new Promise(() => {}))).toEqual(true)
      expect(isPromise(Promise.resolve('waw'))).toEqual(true)
      expect(isPromise(Promise.resolve(false))).toEqual(true)
      expect(isPromise(Promise.reject(false).catch(() => {}))).toEqual(true)
      expect(isPromise(false)).toEqual(false)
      expect(isPromise(true)).toEqual(false)
      expect(isPromise({})).toEqual(false)
      expect(isPromise({ then: () => {} })).toEqual(true)
      expect(isPromise({ then: async () => {} })).toEqual(true)
    })
  })

  describe('isPlainObject', () => {
    test('truthy', () => {
      expect(isPlainObject(Object.create({}))).toEqual(true)
      expect(isPlainObject(Object.create(Object.prototype))).toEqual(true)
      expect(isPlainObject({ foo: 'bar' })).toEqual(true)
      expect(isPlainObject({})).toEqual(true)
      expect(isPlainObject(Object.create(null))).toEqual(true)
    })

    test('falsy', () => {
      class Student {
        protected readonly profile: unknown
        constructor() {
          this.profile = {}
        }
      }

      expect(isPlainObject(/foo/)).toEqual(false)
      expect(isPlainObject(function () {})).toEqual(false)
      expect(isPlainObject(1)).toEqual(false)
      expect(isPlainObject(['foo', 'bar'])).toEqual(false)
      expect(isPlainObject([])).toEqual(false)
      expect(isPlainObject(new Student())).toEqual(false)
      expect(isPlainObject(null)).toEqual(false)
    })
  })
})
