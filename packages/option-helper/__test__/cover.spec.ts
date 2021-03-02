import { coverBoolean, coverNumber, coverString } from '../src'

describe('cover', function () {
  describe('coverBoolean', function () {
    test('(true, undefined) => true', () =>
      expect(coverBoolean(true, undefined)).toEqual(true))
    test('(true, null) => true', () =>
      expect(coverBoolean(true, null)).toEqual(true))
    test('(true, 0) => true', () => expect(coverBoolean(true, 0)).toEqual(true))
    test('(false) => true', () => expect(coverBoolean(false)).toEqual(false))
    test('(false, []) => false', () =>
      expect(coverBoolean(false, [])).toEqual(false))
    test('(false, {}) => false', () =>
      expect(coverBoolean(false, {})).toEqual(false))
    test('(false, true) => true', () =>
      expect(coverBoolean(false, true)).toEqual(true))
    test("(false, 'true') => true", () =>
      expect(coverBoolean(false, 'true')).toEqual(true))
    test("(true, 'FaLse') => false", () =>
      expect(coverBoolean(false, 'FaLse')).toEqual(false))
  })

  describe('coverNumber', function () {
    test('(3, undefined) => 3', () =>
      expect(coverNumber(3, undefined)).toEqual(3))
    test('(3, null) => 3', () => expect(coverNumber(3, null)).toEqual(3))
    test('(3, 0) => 0', () => expect(coverNumber(3, 0)).toEqual(0))
    test('(3, true) => 3', () => expect(coverNumber(3, true)).toEqual(3))
    test('(3, false) => 3', () => expect(coverNumber(3, false)).toEqual(3))
    test('(3, []) => 3', () => expect(coverNumber(3, [])).toEqual(3))
    test('(3, {}) => 3', () => expect(coverNumber(3, {})).toEqual(3))
    test("(3, '5') => 5", () => expect(coverNumber(3, '5')).toEqual(5))
    test("(3, '') => 3", () => expect(coverNumber(3, '')).toEqual(3))
  })

  describe('coverString', function () {
    test("('x', undefined) => 'x'", () =>
      expect(coverString('x', undefined)).toEqual('x'))
    test("('x', null) => 'x'", () =>
      expect(coverString('x', null)).toEqual('x'))
    test("('x', 'y') => 'y'", () => expect(coverString('x', 'y')).toEqual('y'))
    test("('x', 0) => '0'", () => expect(coverString('x', 0)).toEqual('0'))
    test("('x', []) => 'x'", () => expect(coverString('x', [])).toEqual('x'))
    test("('x', {}) => 'x'", () => expect(coverString('x', {})).toEqual('x'))
    test("('x', true) => 'x'", () =>
      expect(coverString('x', true)).toEqual('true'))
    test("('x', false) => 'x'", () =>
      expect(coverString('x', false)).toEqual('false'))
  })
})
