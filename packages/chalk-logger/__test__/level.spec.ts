import { DEBUG, ERROR, FATAL, INFO, Level, VERBOSE, WARN } from '../src'

describe('Level', function () {
  test('debug', function () {
    expect(Level.valueOf('debug')).toBe(DEBUG)
  })

  test('verbose', function () {
    expect(Level.valueOf('verbo')).toBe(VERBOSE)
    expect(Level.valueOf('verbose')).toBe(VERBOSE)
  })

  test('info', function () {
    expect(Level.valueOf('info')).toBe(INFO)
    expect(Level.valueOf('information')).toBe(INFO)
  })

  test('warning', function () {
    expect(Level.valueOf('warn')).toBe(WARN)
    expect(Level.valueOf('warning')).toBe(WARN)
  })

  test('error', function () {
    expect(Level.valueOf('error')).toBe(ERROR)
  })

  test('fatal', function () {
    expect(Level.valueOf('fatal')).toBe(FATAL)
  })
})
