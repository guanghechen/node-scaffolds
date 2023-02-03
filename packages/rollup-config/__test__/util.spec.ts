import { convertToBoolean, coverBoolean, isArray } from '../src'

describe('convertToBoolean', () => {
  test('true ==> true', () => expect(convertToBoolean(true)).toEqual(true))
  test('false ==> false', () => expect(convertToBoolean(false)).toEqual(false))
  test("'True' ==> true", () => expect(convertToBoolean('True')).toEqual(true))
  test("'FaLSe' ==> false", () => expect(convertToBoolean('FaLSe')).toEqual(false))
  test('undefined ==> null', () => expect(convertToBoolean(undefined)).toBeNull())
  test('null ==> null', () => expect(convertToBoolean(null)).toBeNull())
  test('0 ==> null', () => expect(convertToBoolean(0)).toBeNull())
  test('1 ==> null', () => expect(convertToBoolean(1)).toBeNull())
  test('[] ==> null', () => expect(convertToBoolean([])).toBeNull())
  test('{} ==> null', () => expect(convertToBoolean({})).toBeNull())
  test("'' ==> null", () => expect(convertToBoolean('')).toBeNull())
})

describe('coverBoolean', function () {
  test('(true, undefined) => true', () => expect(coverBoolean(true, undefined)).toEqual(true))
  test('(true, null) => true', () => expect(coverBoolean(true, null)).toEqual(true))
  test('(true, 0) => true', () => expect(coverBoolean(true, 0)).toEqual(true))
  test('(false) => true', () => expect(coverBoolean(false)).toEqual(false))
  test('(false, []) => false', () => expect(coverBoolean(false, [])).toEqual(false))
  test('(false, {}) => false', () => expect(coverBoolean(false, {})).toEqual(false))
  test('(false, true) => true', () => expect(coverBoolean(false, true)).toEqual(true))
  test("(false, 'true') => true", () => expect(coverBoolean(false, 'true')).toEqual(true))
  test("(true, 'FaLse') => false", () => expect(coverBoolean(false, 'FaLse')).toEqual(false))
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
