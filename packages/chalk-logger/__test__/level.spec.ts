import { DEBUG, ERROR, FATAL, INFO, Level, VERBOSE, WARN, resolveLevel } from '../src'

describe('Level', () => {
  test('legacy', () => {
    expect(DEBUG).toBe(Level.DEBUG)
    expect(VERBOSE).toBe(Level.VERBOSE)
    expect(INFO).toBe(Level.INFO)
    expect(WARN).toBe(Level.WARN)
    expect(ERROR).toBe(Level.ERROR)
    expect(FATAL).toBe(Level.FATAL)
  })

  test('debug', () => {
    expect(resolveLevel('debug')).toBe(Level.DEBUG)
  })

  test('verbose', () => {
    expect(resolveLevel('verb')).toBe(Level.VERBOSE)
    expect(resolveLevel('verbose')).toBe(Level.VERBOSE)
  })

  test('info', () => {
    expect(resolveLevel('info')).toBe(Level.INFO)
    expect(resolveLevel('information')).toBe(Level.INFO)
  })

  test('warning', () => {
    expect(resolveLevel('warn')).toBe(Level.WARN)
    expect(resolveLevel('warning')).toBe(Level.WARN)
  })

  test('error', () => {
    expect(resolveLevel('error')).toBe(Level.ERROR)
  })

  test('fatal', () => {
    expect(resolveLevel('fatal')).toBe(Level.FATAL)
  })
})
