/* eslint-disable no-new-func */
/* eslint-disable no-new-object */
/* eslint-disable no-new-wrappers */
import {
  isArray,
  isBigint,
  isBoolean,
  isEmptyObject,
  isFunction,
  isInteger,
  isNonBlankString,
  isNotEmptyArray,
  isNotEmptyObject,
  isNumber,
  isNumberLike,
  isObject,
  isPrimitiveBoolean,
  isPrimitiveInteger,
  isPrimitiveNumber,
  isPrimitiveString,
  isString,
  isSymbol,
  isUndefined,
} from '../src'

describe('is', function () {
  describe('isUndefined', function () {
    test('`undefined` is undefined', () =>
      expect(isUndefined(undefined)).toBeTruthy())
    test('`null` is not undefined', () => expect(isUndefined(null)).toBeFalsy())
    test('`false` is not undefined', () =>
      expect(isUndefined(false)).toBeFalsy())
    test('`0` is not undefined', () => expect(isUndefined(0)).toBeFalsy())
    test('empty string is not undefined', () =>
      expect(isUndefined('')).toBeFalsy())
    test('empty array is not undefined', () =>
      expect(isUndefined([])).toBeFalsy())
    test('empty object is not undefined', () =>
      expect(isUndefined({})).toBeFalsy())
  })

  describe('isBoolean', function () {
    test('`false` is a boolean type', () =>
      expect(isBoolean(false)).toBeTruthy())
    test('`true` is a boolean type', () => expect(isBoolean(true)).toBeTruthy())
    test('`new Boolean(undefined)` is a boolean type', () =>
      expect(isBoolean(new Boolean(undefined))).toBeTruthy())
    test('`new Boolean(null)` is a boolean type', () =>
      expect(isBoolean(new Boolean(null))).toBeTruthy())
    test('`new Boolean(1)` is a boolean type', () =>
      expect(isBoolean(new Boolean(1))).toBeTruthy())
    test("`new Boolean('')` is a boolean type", () =>
      expect(isBoolean(new Boolean(''))).toBeTruthy())
    test('`undefined` is not a boolean type', () =>
      expect(isBoolean(undefined)).toBeFalsy())
    test('`null` is not a boolean type', () =>
      expect(isBoolean(null)).toBeFalsy())
    test('empty string is not a boolean type', () =>
      expect(isBoolean('')).toBeFalsy())
    test('empty array is not a boolean type', () =>
      expect(isBoolean([])).toBeFalsy())
    test('empty object is not a boolean type', () =>
      expect(isBoolean({})).toBeFalsy())
  })

  describe('isNumber', function () {
    test('`0` is a number', () => expect(isNumber(0)).toBeTruthy())
    test('`1` is a number', () => expect(isNumber(1)).toBeTruthy())
    test('`-1` is a number', () => expect(isNumber(-1)).toBeTruthy())
    test('`-1.0234` is a number', () => expect(isNumber(-1.0234)).toBeTruthy())
    test("new Number(`'1')` is a number", () =>
      expect(isNumber(new Number('-1'))).toBeTruthy())
    test("`'1'` is not a number", () => expect(isNumber('1')).toBeFalsy())
    test('`undefined` is not a number', () =>
      expect(isNumber(undefined)).toBeFalsy())
    test('`null` is not a number', () => expect(isNumber(null)).toBeFalsy())
    test('empty string is not a number', () => expect(isNumber('')).toBeFalsy())
    test('empty array is not a number', () => expect(isNumber([])).toBeFalsy())
    test('empty object is not a number', () => expect(isNumber({})).toBeFalsy())
    test('bigint is not a number', () =>
      expect(isNumber(BigInt(233))).toBeFalsy())
  })

  describe('isString', function () {
    test("`'x'` is a string", () => expect(isString('x')).toBeTruthy())
    test('`new String(1)` is a string', () =>
      expect(isString(new String(1))).toBeTruthy())
    test('`undefined` is not a string', () =>
      expect(isString(undefined)).toBeFalsy())
    test('`null` is not a string', () => expect(isString(null)).toBeFalsy())
    test('empty string is a string', () => expect(isString('')).toBeTruthy())
    test('empty array is not a string', () => expect(isString([])).toBeFalsy())
    test('empty object is not a string', () => expect(isString({})).toBeFalsy())
  })

  describe('isBigint', function () {
    test('`BigInt(0)` is a bigint', () =>
      expect(isBigint(BigInt(0))).toBeTruthy())
    test('`0` is not a bigint', () => expect(isBigint(0)).toBeFalsy())
    test('`undefined` is not a bigint', () =>
      expect(isBigint(undefined)).toBeFalsy())
    test('`null` is not a bigint', () => expect(isBigint(null)).toBeFalsy())
    test('empty string is not a bigint', () => expect(isBigint('')).toBeFalsy())
    test('empty array is not a bigint', () => expect(isBigint([])).toBeFalsy())
    test('empty object is not a bigint', () => expect(isBigint({})).toBeFalsy())
  })

  describe('isSymbol', function () {
    test("`Symbol('x')` is a symbol", () =>
      expect(isSymbol(Symbol('x'))).toBeTruthy())
    test("`Symbol.for('x')` is a symbol", () =>
      expect(isSymbol(Symbol.for('x'))).toBeTruthy())
    test('`undefined` is not a symbol', () =>
      expect(isSymbol(undefined)).toBeFalsy())
    test('`null` is not a symbol', () => expect(isSymbol(null)).toBeFalsy())
    test('literal string is not a symbol', () =>
      expect(isSymbol('x')).toBeFalsy())
    test('empty array is not a symbol', () => expect(isSymbol([])).toBeFalsy())
    test('empty object is not a symbol', () => expect(isSymbol({})).toBeFalsy())
  })

  describe('isInteger', function () {
    test('`-1` is a integer', () => expect(isInteger(-1)).toBeTruthy())
    test("new Number(`'1')` is a integer", () =>
      expect(isInteger(new Number('-1'))).toBeTruthy())
    test('`1.000` is not a integer', () => expect(isInteger(1.0)).toBeTruthy())
    test('`1.002` is not a integer', () => expect(isInteger(1.002)).toBeFalsy())
    test('`undefined` is not a integer', () =>
      expect(isInteger(undefined)).toBeFalsy())
    test('`null` is not a integer', () => expect(isInteger(null)).toBeFalsy())
    test('literal string is not a integer', () =>
      expect(isInteger('x')).toBeFalsy())
    test('empty array is not a integer', () =>
      expect(isInteger([])).toBeFalsy())
    test('empty object is not a integer', () =>
      expect(isInteger({})).toBeFalsy())
    test('bigint is not a integer', () =>
      expect(isInteger(BigInt(1))).toBeFalsy())
  })

  describe('isArray', function () {
    test('`new Array(3)` is an array', () =>
      expect(isArray(new Array(3))).toBeTruthy())
    test("`[1, 2, 'x']` is an array", () =>
      expect(isArray([1, 2, 'x'])).toBeTruthy())
    test('`undefined` is not an array', () =>
      expect(isArray(undefined)).toBeFalsy())
    test('`null` is not an array', () => expect(isArray(null)).toBeFalsy())
    test('string is not an array', () => expect(isArray('x')).toBeFalsy())
    test('empty object is not an array', () => expect(isArray({})).toBeFalsy())
    test('empty array is an array', () => expect(isArray([])).toBeTruthy())
    test('array like object is not an array', () =>
      expect(isArray({ 1: 'waw' })).toBeFalsy())
  })

  describe('isObject', function () {
    test('`new Object()` is an object', () =>
      expect(isObject(new Object())).toBeTruthy())
    test('array like object is an object', () =>
      expect(isObject({ 1: 'waw' })).toBeTruthy())
    test('empty object is an object', () => expect(isObject({})).toBeTruthy())
    test('function is not an object', () =>
      expect(isObject(new Function("console.log('waw')"))).toBeFalsy())
    test('`undefined` is not an object', () =>
      expect(isObject(undefined)).toBeFalsy())
    test('`null` is not an object', () => expect(isObject(null)).toBeFalsy())
  })

  describe('isFunction', function () {
    test('lambda expressions is a function', () =>
      expect(isFunction(() => {})).toBeTruthy())
    test('anonymous function is a function', () =>
      expect(isFunction(() => {})).toBeTruthy())
    test('instance of Function is a function', () =>
      expect(isFunction(new Function("console.log('waw')"))).toBeTruthy())
    test('empty object is not a function', () =>
      expect(isFunction({})).toBeFalsy())
    test('function string is not a function', () =>
      expect(isFunction("function f () {console.log('waw')}")).toBeFalsy())
    test('`undefined` is not a function', () =>
      expect(isFunction(undefined)).toBeFalsy())
    test('`null` is not a function', () => expect(isFunction(null)).toBeFalsy())
  })

  describe('isPrimitiveBoolean', function () {
    test('`false` is a primitive boolean', () =>
      expect(isPrimitiveBoolean(false)).toBeTruthy())
    test('`true` is a primitive boolean', () =>
      expect(isPrimitiveBoolean(true)).toBeTruthy())
    test('`new Boolean(false)` is not a primitive boolean type', () =>
      expect(isPrimitiveBoolean(new Boolean(false))).toBeFalsy())
    test('`new Boolean(true)` is not a primitive boolean type', () =>
      expect(isPrimitiveBoolean(new Boolean(true))).toBeFalsy())
    test('`undefined` is not a primitive boolean', () =>
      expect(isPrimitiveBoolean(undefined)).toBeFalsy())
    test('`null` is not a primitive boolean', () =>
      expect(isPrimitiveBoolean(null)).toBeFalsy())
  })

  describe('isPrimitiveNumber', function () {
    test('`0` is a primitive number', () =>
      expect(isPrimitiveNumber(0)).toBeTruthy())
    test('`1` is a primitive number', () =>
      expect(isPrimitiveNumber(1)).toBeTruthy())
    test('`-1` is a primitive number', () =>
      expect(isPrimitiveNumber(-1)).toBeTruthy())
    test('`-1.0234` is a primitive number', () =>
      expect(isPrimitiveNumber(-1.0234)).toBeTruthy())
    test("new Number(`'1')` is not a primitive number", () =>
      expect(isPrimitiveNumber(new Number('-1'))).toBeFalsy())
    test("`'1'` is not a primitive number", () =>
      expect(isPrimitiveNumber('1')).toBeFalsy())
    test('`undefined` is not a primitive number', () =>
      expect(isPrimitiveNumber(undefined)).toBeFalsy())
    test('`null` is not a primitive number', () =>
      expect(isPrimitiveNumber(null)).toBeFalsy())
    test('empty string is not a primitive number', () =>
      expect(isPrimitiveNumber('')).toBeFalsy())
    test('empty array is not a primitive number', () =>
      expect(isPrimitiveNumber([])).toBeFalsy())
    test('empty object is not a primitive number', () =>
      expect(isPrimitiveNumber({})).toBeFalsy())
    test('bigint is not a primitive number', () =>
      expect(isPrimitiveNumber(BigInt(233))).toBeFalsy())
  })

  describe('isPrimitiveInteger', function () {
    test('`-1` is a primitive integer', () =>
      expect(isPrimitiveInteger(-1)).toBeTruthy())
    test('new Number(`1`) is not a primitive integer', () =>
      expect(isPrimitiveInteger(new Number(1))).toBeFalsy())
    test('`1.000` is not a primitive integer', () =>
      expect(isPrimitiveInteger(1.0)).toBeTruthy())
    test('`1.002` is not a primitive integer', () =>
      expect(isPrimitiveInteger(1.002)).toBeFalsy())
    test('`undefined` is not a primitive integer', () =>
      expect(isPrimitiveInteger(undefined)).toBeFalsy())
    test('`null` is not a primitive integer', () =>
      expect(isPrimitiveInteger(null)).toBeFalsy())
    test('literal string is not a primitive integer', () =>
      expect(isPrimitiveInteger('x')).toBeFalsy())
    test('empty array is not a primitive integer', () =>
      expect(isPrimitiveInteger([])).toBeFalsy())
    test('empty object is not a primitive integer', () =>
      expect(isPrimitiveInteger({})).toBeFalsy())
    test('bigint is not a primitive integer', () =>
      expect(isPrimitiveInteger(BigInt(1))).toBeFalsy())
  })

  describe('isPrimitiveString', function () {
    test("`'x'` is a primitive string", () =>
      expect(isPrimitiveString('x')).toBeTruthy())
    test("`new String('x')` is not a primitive string", () =>
      expect(isPrimitiveString(new String('x'))).toBeFalsy())
    test('`undefined` is not a primitive string', () =>
      expect(isPrimitiveString(undefined)).toBeFalsy())
    test('`null` is not a primitive string', () =>
      expect(isPrimitiveString(null)).toBeFalsy())
    test('primitive empty string is a primitive string', () =>
      expect(isPrimitiveString('')).toBeTruthy())
    test('empty array is not a primitive string', () =>
      expect(isPrimitiveString([])).toBeFalsy())
    test('empty object is not a primitive string', () =>
      expect(isPrimitiveString({})).toBeFalsy())
  })

  describe('isNotEmptyString', function () {
    test("`'x'` is a non-empty string", () =>
      expect(isNonBlankString('x')).toBeTruthy())
    test("`''` is not a non-empty string", () =>
      expect(isNonBlankString('')).toBeFalsy())
    test("`new String('x')` is a non-empty string", () =>
      expect(isNonBlankString(new String('x'))).toBeTruthy())
    test('`undefined` is not a non-empty string', () =>
      expect(isNonBlankString(undefined)).toBeFalsy())
    test('`null` is not a non-empty string', () =>
      expect(isNonBlankString(null)).toBeFalsy())
    test('empty string is not a non-empty string', () =>
      expect(isNonBlankString('')).toBeFalsy())
    test('empty array is not a non-empty string', () =>
      expect(isNonBlankString([])).toBeFalsy())
    test('empty object is not a non-empty string', () =>
      expect(isNonBlankString({})).toBeFalsy())
  })

  describe('isNotEmptyArray', function () {
    test('`new Array(3)` is a non-empty array', () =>
      expect(isNotEmptyArray(new Array(3))).toBeTruthy())
    test("`[1, 2, 'x']` is a non-empty array", () =>
      expect(isNotEmptyArray([1, 2, 'x'])).toBeTruthy())
    test('`undefined` is not a non-empty array', () =>
      expect(isNotEmptyArray(undefined)).toBeFalsy())
    test('`null` is not a non-empty array', () =>
      expect(isNotEmptyArray(null)).toBeFalsy())
    test('string is not a non-empty array', () =>
      expect(isNotEmptyArray('x')).toBeFalsy())
    test('empty object is not a non-empty array', () =>
      expect(isNotEmptyArray({})).toBeFalsy())
    test('empty array is not a non-empty array', () =>
      expect(isNotEmptyArray([])).toBeFalsy())
    test('non-empty array like object is not a non-empty array', () =>
      expect(isNotEmptyArray({ 1: 'waw' })).toBeFalsy())
  })

  describe('isEmptyObject', function () {
    test('`new Object()` is an empty object', () =>
      expect(isEmptyObject(new Object())).toBeTruthy())
    test('`new Object({ x: 1 })` is not an empty object', () =>
      expect(isEmptyObject(new Object({ x: 1 }))).toBeFalsy())
    test('empty object is an empty object', () =>
      expect(isEmptyObject({})).toBeTruthy())
    test('function is not an empty object', () =>
      expect(isEmptyObject(new Function("console.log('waw')"))).toBeFalsy())
    test('`undefined` is not an empty object', () =>
      expect(isEmptyObject(undefined)).toBeFalsy())
    test('`null` is not an empty object', () =>
      expect(isEmptyObject(null)).toBeFalsy())
  })

  describe('isNotEmptyObject', function () {
    test('`new Object()` is a non-empty object', () =>
      expect(isNotEmptyObject(new Object())).toBeFalsy())
    test('`new Object({ x: 1 })` is a non-empty object', () =>
      expect(isNotEmptyObject(new Object({ x: 1 }))).toBeTruthy())
    test('array like object is a non-empty object', () =>
      expect(isNotEmptyObject({ 1: 'waw' })).toBeTruthy())
    test('empty object is not a non-empty object', () =>
      expect(isNotEmptyObject({})).toBeFalsy())
    test('function is not a non-empty object', () =>
      expect(isNotEmptyObject(new Function("console.log('waw')"))).toBeFalsy())
    test('`undefined` is not a non-empty object', () =>
      expect(isNotEmptyObject(undefined)).toBeFalsy())
    test('`null` is not a non-empty object', () =>
      expect(isNotEmptyObject(null)).toBeFalsy())
  })

  describe('isNumberLike', function () {
    test('`0` is a number like', () => expect(isNumberLike(0)).toBeTruthy())
    test('`1` is a number like', () => expect(isNumberLike(1)).toBeTruthy())
    test('`-1` is a number like', () => expect(isNumberLike(-1)).toBeTruthy())
    test('`-1.0234` is a number like', () =>
      expect(isNumberLike(-1.0234)).toBeTruthy())
    test("new Number(`'1')` is a number like", () =>
      expect(isNumberLike(new Number('-1'))).toBeTruthy())
    test("`'1'` is a number like", () => expect(isNumberLike('1')).toBeTruthy())
    test("`'1x'` is a number like", () =>
      expect(isNumberLike('1x')).toBeFalsy())
    test('`undefined` is not a number like', () =>
      expect(isNumberLike(undefined)).toBeFalsy())
    test('`null` is not a number like', () =>
      expect(isNumberLike(null)).toBeFalsy())
    test('empty string is not a number like', () =>
      expect(isNumberLike('')).toBeFalsy())
    test('empty array is not a number like', () =>
      expect(isNumberLike([])).toBeFalsy())
    test('empty object is not a number like', () =>
      expect(isNumberLike({})).toBeFalsy())
    test('bigint is not a number like', () =>
      expect(isNumberLike(BigInt(233))).toBeFalsy())
  })
})
