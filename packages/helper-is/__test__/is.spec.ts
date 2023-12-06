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
    it('`undefined` is undefined', () => expect(isUndefined(undefined)).toBe(true))
    it('`null` is not undefined', () => expect(isUndefined(null)).toBe(false))
    it('`false` is not undefined', () => expect(isUndefined(false)).toBe(false))
    it('`0` is not undefined', () => expect(isUndefined(0)).toBe(false))
    it('empty string is not undefined', () => expect(isUndefined('')).toBe(false))
    it('empty array is not undefined', () => expect(isUndefined([])).toBe(false))
    it('empty object is not undefined', () => expect(isUndefined({})).toBe(false))
  })

  describe('isBoolean', () => {
    it('`false` is a boolean type', () => expect(isBoolean(false)).toBe(true))
    it('`true` is a boolean type', () => expect(isBoolean(true)).toBe(true))
    it('`new Boolean(undefined)` is a boolean type', () =>
      expect(isBoolean(new Boolean(undefined))).toBe(true))
    it('`new Boolean(null)` is a boolean type', () =>
      expect(isBoolean(new Boolean(null))).toBe(true))
    it('`new Boolean(1)` is a boolean type', () => expect(isBoolean(new Boolean(1))).toBe(true))
    test("`new Boolean('')` is a boolean type", () => expect(isBoolean(new Boolean(''))).toBe(true))
    it('`undefined` is not a boolean type', () => expect(isBoolean(undefined)).toBe(false))
    it('`null` is not a boolean type', () => expect(isBoolean(null)).toBe(false))
    it('empty string is not a boolean type', () => expect(isBoolean('')).toBe(false))
    it('empty array is not a boolean type', () => expect(isBoolean([])).toBe(false))
    it('empty object is not a boolean type', () => expect(isBoolean({})).toBe(false))
  })

  describe('isDate', () => {
    it('Instance of Date is a date', () => expect(isDate(new Date())).toBe(true))
    it('Date string is not a date', () => expect(isDate('2021-04-03T07:49:56.260Z')).toBe(false))
    it('null is not a date', () => expect(isDate(null)).toBe(false))
    it('undefined is not a date', () => expect(isDate(undefined)).toBe(false))
  })

  describe('isNumber', () => {
    it('`0` is a number', () => expect(isNumber(0)).toBe(true))
    it('`1` is a number', () => expect(isNumber(1)).toBe(true))
    it('`-1` is a number', () => expect(isNumber(-1)).toBe(true))
    it('`-1.0234` is a number', () => expect(isNumber(-1.0234)).toBe(true))
    test("new Number(`'1')` is a number", () => expect(isNumber(new Number('-1'))).toBe(true))
    test("`'1'` is not a number", () => expect(isNumber('1')).toBe(false))
    it('`undefined` is not a number', () => expect(isNumber(undefined)).toBe(false))
    it('`null` is not a number', () => expect(isNumber(null)).toBe(false))
    it('empty string is not a number', () => expect(isNumber('')).toBe(false))
    it('empty array is not a number', () => expect(isNumber([])).toBe(false))
    it('empty object is not a number', () => expect(isNumber({})).toBe(false))
    it('bigint is not a number', () => expect(isNumber(BigInt(233))).toBe(false))
  })

  describe('isString', () => {
    test("`'x'` is a string", () => expect(isString('x')).toBe(true))
    it('`new String(1)` is a string', () => expect(isString(new String(1))).toBe(true))
    it('`undefined` is not a string', () => expect(isString(undefined)).toBe(false))
    it('`null` is not a string', () => expect(isString(null)).toBe(false))
    it('empty string is a string', () => expect(isString('')).toBe(true))
    it('empty array is not a string', () => expect(isString([])).toBe(false))
    it('empty object is not a string', () => expect(isString({})).toBe(false))
  })

  describe('isBigint', () => {
    it('`BigInt(0)` is a bigint', () => expect(isBigint(BigInt(0))).toBe(true))
    it('`0` is not a bigint', () => expect(isBigint(0)).toBe(false))
    it('`undefined` is not a bigint', () => expect(isBigint(undefined)).toBe(false))
    it('`null` is not a bigint', () => expect(isBigint(null)).toBe(false))
    it('empty string is not a bigint', () => expect(isBigint('')).toBe(false))
    it('empty array is not a bigint', () => expect(isBigint([])).toBe(false))
    it('empty object is not a bigint', () => expect(isBigint({})).toBe(false))
  })

  describe('isSymbol', () => {
    test("`Symbol('x')` is a symbol", () => expect(isSymbol(Symbol('x'))).toBe(true))
    test("`Symbol.for('x')` is a symbol", () => expect(isSymbol(Symbol.for('x'))).toBe(true))
    it('`undefined` is not a symbol', () => expect(isSymbol(undefined)).toBe(false))
    it('`null` is not a symbol', () => expect(isSymbol(null)).toBe(false))
    it('literal string is not a symbol', () => expect(isSymbol('x')).toBe(false))
    it('empty array is not a symbol', () => expect(isSymbol([])).toBe(false))
    it('empty object is not a symbol', () => expect(isSymbol({})).toBe(false))
  })

  describe('isInteger', () => {
    it('`-1` is a integer', () => expect(isInteger(-1)).toBe(true))
    test("new Number(`'1')` is a integer", () => expect(isInteger(new Number('-1'))).toBe(true))
    it('`1.000` is not a integer', () => expect(isInteger(1.0)).toBe(true))
    it('`1.002` is not a integer', () => expect(isInteger(1.002)).toBe(false))
    it('`undefined` is not a integer', () => expect(isInteger(undefined)).toBe(false))
    it('`null` is not a integer', () => expect(isInteger(null)).toBe(false))
    it('literal string is not a integer', () => expect(isInteger('x')).toBe(false))
    it('empty array is not a integer', () => expect(isInteger([])).toBe(false))
    it('empty object is not a integer', () => expect(isInteger({})).toBe(false))
    it('bigint is not a integer', () => expect(isInteger(BigInt(1))).toBe(false))
  })

  describe('isArray', () => {
    it('`new Array(3)` is an array', () => expect(isArray(new Array(3))).toBe(true))
    test("`[1, 2, 'x']` is an array", () => expect(isArray([1, 2, 'x'])).toBe(true))
    it('`undefined` is not an array', () => expect(isArray(undefined)).toBe(false))
    it('`null` is not an array', () => expect(isArray(null)).toBe(false))
    it('string is not an array', () => expect(isArray('x')).toBe(false))
    it('empty object is not an array', () => expect(isArray({})).toBe(false))
    it('empty array is an array', () => expect(isArray([])).toBe(true))
    it('array like object is not an array', () => expect(isArray({ 1: 'waw' })).toBe(false))
  })

  describe('isObject', () => {
    it('`new Object()` is an object', () => expect(isObject(new Object())).toBe(true))
    it('array like object is an object', () => expect(isObject({ 1: 'waw' })).toBe(true))
    it('empty object is an object', () => expect(isObject({})).toBe(true))
    it('function is not an object', () =>
      expect(isObject(new Function("console.log('waw')"))).toBe(false))
    it('`undefined` is not an object', () => expect(isObject(undefined)).toBe(false))
    it('`null` is not an object', () => expect(isObject(null)).toBe(false))
  })

  describe('isFunction', () => {
    it('lambda expressions is a function', () => expect(isFunction(() => {})).toBe(true))
    it('anonymous function is a function', () => expect(isFunction(() => {})).toBe(true))
    it('instance of Function is a function', () =>
      expect(isFunction(new Function("console.log('waw')"))).toBe(true))
    it('async function', () => expect(isFunction(async () => {})).toBe(true))
    it('anonymous async function', () => expect(isFunction(async () => {})).toBe(true))
    it('empty object is not a function', () => expect(isFunction({})).toBe(false))
    it('function string is not a function', () =>
      expect(isFunction("function f () {console.log('waw')}")).toBe(false))
    it('`undefined` is not a function', () => expect(isFunction(undefined)).toBe(false))
    it('`null` is not a function', () => expect(isFunction(null)).toBe(false))
  })

  describe('isPrimitiveBoolean', () => {
    it('`false` is a primitive boolean', () => expect(isPrimitiveBoolean(false)).toBe(true))
    it('`true` is a primitive boolean', () => expect(isPrimitiveBoolean(true)).toBe(true))
    it('`new Boolean(false)` is not a primitive boolean type', () =>
      expect(isPrimitiveBoolean(new Boolean(false))).toBe(false))
    it('`new Boolean(true)` is not a primitive boolean type', () =>
      expect(isPrimitiveBoolean(new Boolean(true))).toBe(false))
    it('`undefined` is not a primitive boolean', () =>
      expect(isPrimitiveBoolean(undefined)).toBe(false))
    it('`null` is not a primitive boolean', () => expect(isPrimitiveBoolean(null)).toBe(false))
  })

  describe('isPrimitiveNumber', () => {
    it('`0` is a primitive number', () => expect(isPrimitiveNumber(0)).toBe(true))
    it('`1` is a primitive number', () => expect(isPrimitiveNumber(1)).toBe(true))
    it('`-1` is a primitive number', () => expect(isPrimitiveNumber(-1)).toBe(true))
    it('`-1.0234` is a primitive number', () => expect(isPrimitiveNumber(-1.0234)).toBe(true))
    test("new Number(`'1')` is not a primitive number", () =>
      expect(isPrimitiveNumber(new Number('-1'))).toBe(false))
    test("`'1'` is not a primitive number", () => expect(isPrimitiveNumber('1')).toBe(false))
    it('`undefined` is not a primitive number', () =>
      expect(isPrimitiveNumber(undefined)).toBe(false))
    it('`null` is not a primitive number', () => expect(isPrimitiveNumber(null)).toBe(false))
    it('empty string is not a primitive number', () => expect(isPrimitiveNumber('')).toBe(false))
    it('empty array is not a primitive number', () => expect(isPrimitiveNumber([])).toBe(false))
    it('empty object is not a primitive number', () => expect(isPrimitiveNumber({})).toBe(false))
    it('bigint is not a primitive number', () => expect(isPrimitiveNumber(BigInt(233))).toBe(false))
  })

  describe('isPrimitiveInteger', () => {
    it('`-1` is a primitive integer', () => expect(isPrimitiveInteger(-1)).toBe(true))
    it('new Number(`1`) is not a primitive integer', () =>
      expect(isPrimitiveInteger(new Number(1))).toBe(false))
    it('`1.000` is not a primitive integer', () => expect(isPrimitiveInteger(1.0)).toBe(true))
    it('`1.002` is not a primitive integer', () => expect(isPrimitiveInteger(1.002)).toBe(false))
    it('`undefined` is not a primitive integer', () =>
      expect(isPrimitiveInteger(undefined)).toBe(false))
    it('`null` is not a primitive integer', () => expect(isPrimitiveInteger(null)).toBe(false))
    it('literal string is not a primitive integer', () =>
      expect(isPrimitiveInteger('x')).toBe(false))
    it('empty array is not a primitive integer', () => expect(isPrimitiveInteger([])).toBe(false))
    it('empty object is not a primitive integer', () => expect(isPrimitiveInteger({})).toBe(false))
    it('bigint is not a primitive integer', () => expect(isPrimitiveInteger(BigInt(1))).toBe(false))
  })

  describe('isPrimitiveString', () => {
    test("`'x'` is a primitive string", () => expect(isPrimitiveString('x')).toBe(true))
    test("`new String('x')` is not a primitive string", () =>
      expect(isPrimitiveString(new String('x'))).toBe(false))
    it('`undefined` is not a primitive string', () =>
      expect(isPrimitiveString(undefined)).toBe(false))
    it('`null` is not a primitive string', () => expect(isPrimitiveString(null)).toBe(false))
    it('primitive empty string is a primitive string', () =>
      expect(isPrimitiveString('')).toBe(true))
    it('empty array is not a primitive string', () => expect(isPrimitiveString([])).toBe(false))
    it('empty object is not a primitive string', () => expect(isPrimitiveString({})).toBe(false))
  })

  describe('isNotEmptyString', () => {
    test("`'x'` is a non-empty string", () => expect(isNonBlankString('x')).toBe(true))
    test("`''` is not a non-empty string", () => expect(isNonBlankString('')).toBe(false))
    test("`new String('x')` is a non-empty string", () =>
      expect(isNonBlankString(new String('x'))).toBe(true))
    it('`undefined` is not a non-empty string', () =>
      expect(isNonBlankString(undefined)).toBe(false))
    it('`null` is not a non-empty string', () => expect(isNonBlankString(null)).toBe(false))
    it('empty string is not a non-empty string', () => expect(isNonBlankString('')).toBe(false))
    it('empty array is not a non-empty string', () => expect(isNonBlankString([])).toBe(false))
    it('empty object is not a non-empty string', () => expect(isNonBlankString({})).toBe(false))
  })

  describe('isNotEmptyArray', () => {
    it('`new Array(3)` is a non-empty array', () =>
      expect(isNotEmptyArray(new Array(3))).toBe(true))
    test("`[1, 2, 'x']` is a non-empty array", () =>
      expect(isNotEmptyArray([1, 2, 'x'])).toBe(true))
    it('`undefined` is not a non-empty array', () => expect(isNotEmptyArray(undefined)).toBe(false))
    it('`null` is not a non-empty array', () => expect(isNotEmptyArray(null)).toBe(false))
    it('string is not a non-empty array', () => expect(isNotEmptyArray('x')).toBe(false))
    it('empty object is not a non-empty array', () => expect(isNotEmptyArray({})).toBe(false))
    it('empty array is not a non-empty array', () => expect(isNotEmptyArray([])).toBe(false))
    it('non-empty array like object is not a non-empty array', () =>
      expect(isNotEmptyArray({ 1: 'waw' })).toBe(false))
  })

  describe('isEmptyObject', () => {
    it('`new Object()` is an empty object', () => expect(isEmptyObject(new Object())).toBe(true))
    it('`new Object({ x: 1 })` is not an empty object', () =>
      expect(isEmptyObject(new Object({ x: 1 }))).toBe(false))
    it('empty object is an empty object', () => expect(isEmptyObject({})).toBe(true))
    it('function is not an empty object', () =>
      expect(isEmptyObject(new Function("console.log('waw')"))).toBe(false))
    it('`undefined` is not an empty object', () => expect(isEmptyObject(undefined)).toBe(false))
    it('`null` is not an empty object', () => expect(isEmptyObject(null)).toBe(false))
  })

  describe('isNotEmptyObject', () => {
    it('`new Object()` is a non-empty object', () =>
      expect(isNotEmptyObject(new Object())).toBe(false))
    it('`new Object({ x: 1 })` is a non-empty object', () =>
      expect(isNotEmptyObject(new Object({ x: 1 }))).toBe(true))
    it('array like object is a non-empty object', () =>
      expect(isNotEmptyObject({ 1: 'waw' })).toBe(true))
    it('empty object is not a non-empty object', () => expect(isNotEmptyObject({})).toBe(false))
    it('function is not a non-empty object', () =>
      expect(isNotEmptyObject(new Function("console.log('waw')"))).toBe(false))
    it('`undefined` is not a non-empty object', () =>
      expect(isNotEmptyObject(undefined)).toBe(false))
    it('`null` is not a non-empty object', () => expect(isNotEmptyObject(null)).toBe(false))
  })

  describe('isNumberLike', () => {
    it('`0` is a number like', () => expect(isNumberLike(0)).toBe(true))
    it('`1` is a number like', () => expect(isNumberLike(1)).toBe(true))
    it('`-1` is a number like', () => expect(isNumberLike(-1)).toBe(true))
    it('`-1.0234` is a number like', () => expect(isNumberLike(-1.0234)).toBe(true))
    test("new Number(`'1')` is a number like", () =>
      expect(isNumberLike(new Number('-1'))).toBe(true))
    test("`'1'` is a number like", () => expect(isNumberLike('1')).toBe(true))
    test("`'1x'` is a number like", () => expect(isNumberLike('1x')).toBe(false))
    it('`undefined` is not a number like', () => expect(isNumberLike(undefined)).toBe(false))
    it('`null` is not a number like', () => expect(isNumberLike(null)).toBe(false))
    it('empty string is not a number like', () => expect(isNumberLike('')).toBe(false))
    it('empty array is not a number like', () => expect(isNumberLike([])).toBe(false))
    it('empty object is not a number like', () => expect(isNumberLike({})).toBe(false))
    it('bigint is not a number like', () => expect(isNumberLike(BigInt(233))).toBe(false))
  })

  describe('isArrayOfT', () => {
    it('string[], isString', () => expect(isArrayOfT(['a', 'b'], isString)).toBe(true))
    it('string[], isNumber', () => expect(isArrayOfT(['a', 'b'], isNumber)).toBe(false))
    it('(string|number)[], isString', () => expect(isArrayOfT(['a', 'b', 2], isString)).toBe(false))
    it('(string|null)[], isString', () =>
      expect(isArrayOfT(['a', 'b', null], isString)).toBe(false))
    it('(string|undefined)[], isString', () =>
      expect(isArrayOfT(['a', 'b', undefined], isString)).toBe(false))
    it('string, isString', () => expect(isArrayOfT('a', isString)).toBe(false))
    it('number, isString', () => expect(isArrayOfT(1, isString)).toBe(false))
    it('null, isString', () => expect(isArrayOfT(null, isString)).toBe(false))
    it('undefined, isString', () => expect(isArrayOfT(undefined, isString)).toBe(false))
  })

  describe('isTwoDimensionArrayOfT', () => {
    it('string[][], isString', () =>
      expect(isTwoDimensionArrayOfT([['a', 'b'], ['b']], isString)).toBe(true))
    it('string[], isString', () => expect(isTwoDimensionArrayOfT(['a', 'b'], isString)).toBe(false))
    it('(string|null)[][], isString', () =>
      expect(
        isTwoDimensionArrayOfT(
          [
            ['a', 'b'],
            ['b', null],
          ],
          isString,
        ),
      ).toBe(false))
    it('(string|undefined)[][], isString', () =>
      expect(isTwoDimensionArrayOfT([['a', 'b', undefined, 'c'], ['b']], isString)).toBe(false))
    it('(string[]|unknown)[], isString', () =>
      expect(isTwoDimensionArrayOfT([['a', 'b'], ['b'], 'c'], isString)).toBe(false))
    it('string, isString', () => expect(isTwoDimensionArrayOfT('c', isString)).toBe(false))
  })

  describe('isPromise', () => {
    it('isPromise', () => {
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
    it('truthy', () => {
      expect(isPlainObject(Object.create({}))).toEqual(true)
      expect(isPlainObject(Object.create(Object.prototype))).toEqual(true)
      expect(isPlainObject({ foo: 'bar' })).toEqual(true)
      expect(isPlainObject({})).toEqual(true)
      expect(isPlainObject(Object.create(null))).toEqual(true)
    })

    it('falsy', () => {
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
