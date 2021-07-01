import { ChalkLogger, DEBUG, ERROR, FATAL, INFO, VERBOSE, WARN } from '../src'

describe('ChalkLogger', function () {
  test('setName and setBaseName', function () {
    const logger = new ChalkLogger({ name: 'basename' })
    expect(logger.name).toBe('basename')

    logger.setName('name')
    expect(logger.name).toBe('basename name')

    logger.setBaseName('new basename')
    expect(logger.name).toBe('new basename name')

    logger.setName('new name')
    expect(logger.name).toBe('new basename new name')

    logger.setName(null)
    expect(logger.name).toBe('new basename')

    logger.setBaseName(null)
    expect(logger.name).toBe('')
  })

  test('setMode', function () {
    const logger = new ChalkLogger()
    expect(logger.mode).toBe('normal')

    logger.setMode('normal')
    expect(logger.mode).toBe('normal')

    logger.setMode('loose')
    expect(logger.mode).toBe('loose')
  })

  test('setLevel', function () {
    const logger = new ChalkLogger()
    expect(logger.level).toBe(INFO)

    for (const level of [DEBUG, VERBOSE, INFO, WARN, ERROR, FATAL]) {
      logger.setLevel(level)
      expect(logger.level).toBe(level)
    }
  })
})
