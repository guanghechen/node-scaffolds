import { jest } from '@jest/globals'
import { cover, coverBoolean, coverInteger, coverNumber, coverString } from '../src'

describe('cover', function () {
  it('lazy defaultValue', function () {
    const fn = jest.fn(() => 'alpha')
    expect(cover<string>(fn, 'beta')).toEqual('beta')
    expect(fn.mock.calls.length).toBe(0)

    expect(cover<string>(fn, null)).toEqual('alpha')
    expect(fn.mock.calls.length).toBe(1)
  })

  it('validation', function () {
    const validator = (text: string): boolean => /^alpha|beta$/i.test(text)
    expect(cover<string>('alpha', 'theta', validator)).toEqual('alpha')
    expect(cover<string>('alpha', 'beta', validator)).toEqual('beta')
    expect(cover<string>('alpha', 'AlPha', validator)).toEqual('AlPha')
  })

  describe('coverBoolean', function () {
    it('(true, undefined) => true', () => expect(coverBoolean(true, undefined)).toEqual(true))
    it('(true, null) => true', () => expect(coverBoolean(true, null)).toEqual(true))
    it('(true, 0) => true', () => expect(coverBoolean(true, 0)).toEqual(true))
    it('(false) => true', () => expect(coverBoolean(false)).toEqual(false))
    it('(false, []) => false', () => expect(coverBoolean(false, [])).toEqual(false))
    it('(false, {}) => false', () => expect(coverBoolean(false, {})).toEqual(false))
    it('(false, true) => true', () => expect(coverBoolean(false, true)).toEqual(true))
    test("(false, 'true') => true", () => expect(coverBoolean(false, 'true')).toEqual(true))
    test("(true, 'FaLse') => false", () => expect(coverBoolean(false, 'FaLse')).toEqual(false))
  })

  describe('coverInteger', function () {
    it('(3, undefined) => 3', () => expect(coverInteger(3, undefined)).toEqual(3))
    it('(3, null) => 3', () => expect(coverInteger(3, null)).toEqual(3))
    it('(3, 0) => 0', () => expect(coverInteger(3, 0)).toEqual(0))
    it('(3, 23.23) => 23', () => expect(coverInteger(3, 23.23)).toEqual(23))
    it('(3, -23.23) => -23', () => expect(coverInteger(3, -23.23)).toEqual(-23))
    it('(3, true) => 3', () => expect(coverInteger(3, true)).toEqual(3))
    it('(3, false) => 3', () => expect(coverInteger(3, false)).toEqual(3))
    it('(3, []) => 3', () => expect(coverInteger(3, [])).toEqual(3))
    it('(3, {}) => 3', () => expect(coverInteger(3, {})).toEqual(3))
    test("(3, '5') => 5", () => expect(coverInteger(3, '5')).toEqual(5))
    test("(3, '') => 3", () => expect(coverInteger(3, '')).toEqual(3))
  })

  describe('coverNumber', function () {
    it('(3, undefined) => 3', () => expect(coverNumber(3, undefined)).toEqual(3))
    it('(3, null) => 3', () => expect(coverNumber(3, null)).toEqual(3))
    it('(3, 0) => 0', () => expect(coverNumber(3, 0)).toEqual(0))
    it('(3, 23.23) => 23', () => expect(coverNumber(3, 23.23)).toEqual(23.23))
    it('(3, -23.23) => -23', () => expect(coverNumber(3, -23.23)).toEqual(-23.23))
    it('(3, true) => 3', () => expect(coverNumber(3, true)).toEqual(3))
    it('(3, false) => 3', () => expect(coverNumber(3, false)).toEqual(3))
    it('(3, []) => 3', () => expect(coverNumber(3, [])).toEqual(3))
    it('(3, {}) => 3', () => expect(coverNumber(3, {})).toEqual(3))
    test("(3, '5') => 5", () => expect(coverNumber(3, '5')).toEqual(5))
    test("(3, '') => 3", () => expect(coverNumber(3, '')).toEqual(3))
  })

  describe('coverString', function () {
    test("('x', undefined) => 'x'", () => expect(coverString('x', undefined)).toEqual('x'))
    test("('x', null) => 'x'", () => expect(coverString('x', null)).toEqual('x'))
    test("('x', 'y') => 'y'", () => expect(coverString('x', 'y')).toEqual('y'))
    test("('x', 0) => '0'", () => expect(coverString('x', 0)).toEqual('0'))
    test("('x', []) => 'x'", () => expect(coverString('x', [])).toEqual('x'))
    test("('x', {}) => 'x'", () => expect(coverString('x', {})).toEqual('x'))
    test("('x', true) => 'x'", () => expect(coverString('x', true)).toEqual('true'))
    test("('x', false) => 'x'", () => expect(coverString('x', false)).toEqual('false'))
  })
})
