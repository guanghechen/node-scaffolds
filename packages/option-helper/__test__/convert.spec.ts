import { convertToBoolean, convertToNumber, convertToString } from '../src'

describe('convert', function () {
  describe('convertToBoolean', function () {
    test('true ==> true', () => expect(convertToBoolean(true)).toEqual(true))
    test('false ==> false', () =>
      expect(convertToBoolean(false)).toEqual(false))
    test("'True' ==> true", () =>
      expect(convertToBoolean('True')).toEqual(true))
    test("'FaLSe' ==> false", () =>
      expect(convertToBoolean('FaLSe')).toEqual(false))
    test('undefined ==> null', () =>
      expect(convertToBoolean(undefined)).toBeNull())
    test('null ==> null', () => expect(convertToBoolean(null)).toBeNull())
    test('0 ==> null', () => expect(convertToBoolean(0)).toBeNull())
    test('1 ==> null', () => expect(convertToBoolean(1)).toBeNull())
    test('[] ==> null', () => expect(convertToBoolean([])).toBeNull())
    test('{} ==> null', () => expect(convertToBoolean({})).toBeNull())
    test("'' ==> null", () => expect(convertToBoolean('')).toBeNull())
  })

  describe('convertToNumber', function () {
    test('0 ==> 0', () => expect(convertToNumber(0)).toEqual(0))
    test('1 ==> 1', () => expect(convertToNumber(1)).toEqual(1))
    test("'0' ==> 0", () => expect(convertToNumber('0')).toEqual(0))
    test("'1' ==> 1", () => expect(convertToNumber('1')).toEqual(1))
    test("'-1' ==> -1", () => expect(convertToNumber('-1')).toEqual(-1))
    test("'1xxx_y' ==> null", () =>
      expect(convertToNumber('1xxx_y')).toBeNull())
    test('true ==> null', () => expect(convertToNumber(true)).toBeNull())
    test('false ==> null', () => expect(convertToNumber(false)).toBeNull())
    test('undefined ==> null', () =>
      expect(convertToNumber(undefined)).toBeNull())
    test('null ==> null', () => expect(convertToNumber(null)).toBeNull())
    test('[] ==> null', () => expect(convertToNumber([])).toBeNull())
    test('{} ==> null', () => expect(convertToNumber({})).toBeNull())
    test("'' ==> null", () => expect(convertToNumber('')).toBeNull())
  })

  describe('convertToString', function () {
    test("'' ==> ''", () => expect(convertToString('')).toEqual(''))
    test("-1 ==> '-1'", () => expect(convertToString(-1)).toEqual('-1'))
    test("true ==> 'true'", () => expect(convertToString(true)).toEqual('true'))
    test("false ==> 'false'", () =>
      expect(convertToString(false)).toEqual('false'))
    test('undefined ==> null', () =>
      expect(convertToString(undefined)).toBeNull())
    test('null ==> null', () => expect(convertToString(null)).toBeNull())
    test('[] ==> null', () => expect(convertToString([])).toBeNull())
    test('{} ==> null', () => expect(convertToString({})).toBeNull())
  })
})
