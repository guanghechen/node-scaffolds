import { createLoggerMock } from '@guanghechen/jest-helper'
import { desensitize } from 'jest.setup'
import { colorToChalk } from '../src/color'
import { DEBUG, Level, VERBOSE } from '../src/level'
import type { LoggerOptions } from '../src/logger'
import { Logger } from '../src/logger'

describe('Logger', function () {
  const levels: string[] = [
    'debug',
    'verbose',
    'info',
    'warn',
    'error',
    'fatal',
  ]
  const methods: string[] = [
    'debug',
    'verbose',
    'info',
    'warn',
    'error',
    'fatal',
  ]

  describe('base', function () {
    for (const mode of ['normal', 'loose']) {
      for (const level of levels) {
        for (const shouldInline of [false, true]) {
          for (const shouldColorful of [false, true]) {
            for (const shouldDate of [false, true]) {
              for (const shouldTitle of [false, true]) {
                const options: LoggerOptions = {
                  mode: mode as 'normal' | 'loose',
                  level: Level.valueOf(level),
                  inline: shouldInline,
                  colorful: shouldColorful,
                  date: shouldDate,
                  title: shouldTitle,
                }

                let title = mode + ' ' + level
                if (shouldInline) title += ' +inline'
                if (shouldColorful) title += ' +colorful'
                if (shouldDate) title += ' +date'
                if (shouldTitle) title += ' +title'

                // eslint-disable-next-line jest/valid-title
                test(title, function (): void {
                  const logger = new Logger({ ...options, name: level })
                  const loggerMock = createLoggerMock({
                    logger,
                    desensitize,
                  })

                  for (const method of methods) {
                    const log = logger[method].bind(logger)
                    log(
                      '{}, {}, {}, {}, {}, {}, {}',
                      1,
                      'ooo',
                      null,
                      true,
                      false,
                      undefined,
                      'a\nb',
                    )
                    log('This is a literal string', ['a', 'b'])
                    log('Output object: {}', { x: 1, y: { z: 'o' } })
                    log('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
                    log('user(<>)', {
                      username: 'lemon-clown',
                      avatar:
                        'https://avatars0.githubusercontent.com/u/42513619?s=400&u=d878f4532bb5749979e18f3696b8985b90e9f78b&v=4',
                    })
                  }

                  expect(loggerMock.getIndiscriminateAll()).toMatchSnapshot()
                  loggerMock.restore()
                })
              }
            }
          }
        }
      }
    }
  })

  test('custom +placeholderRegex', function () {
    const logger = new Logger({
      name: 'complex',
      mode: 'normal',
      level: DEBUG,
      inline: false,
      colorful: false,
      date: true,
      placeholderRegex: /(?<!\\)<>/g, // change placeholder of string format
    })
    const loggerMock = createLoggerMock({ logger, desensitize })

    const log = logger.debug.bind(logger)
    log(
      '{}, {}, {}, {}, {}, {}, {}',
      1,
      'ooo',
      null,
      true,
      false,
      undefined,
      () => 'a\nb\n',
    )
    log(
      '<>, <>, <>, <>, <>, <>, <>',
      1,
      'ooo',
      null,
      true,
      false,
      undefined,
      () => 'a\nb\n',
    )
    log('user(<>)', {
      username: 'lemon-clown',
      avatar:
        'https://avatars0.githubusercontent.com/u/42513619?s=400&u=d878f4532bb5749979e18f3696b8985b90e9f78b&v=4',
    })

    // Error is hard to test
    log(
      'bad argument (<>). error({})',
      { username: 123 },
      new Error('username is invalid').message,
    )

    log('a: {}, b: {}', 1, 2, 3)

    expect(loggerMock.getIndiscriminateAll()).toMatchSnapshot()
    loggerMock.restore()
  })

  test('custom +dateChalk +nameChalk', function () {
    const logger = new Logger({
      name: 'complex',
      mode: 'normal',
      level: DEBUG,
      inline: false,
      colorful: true,
      date: true,
      dateChalk: colorToChalk([25, 104, 179], false),
      nameChalk: colorToChalk([25, 104, 179], true),
    })
    const loggerMock = createLoggerMock({ logger, desensitize })

    const log = logger.debug.bind(logger)
    log('{}, {}, {}, {}, {}, {}', 1, 'ooo', null, true, false, undefined)
    log('This is a literal string')
    log('Output object: {}', { x: 1, y: { z: 'o' } })
    log('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
    log('user(<>)', {
      username: 'lemon-clown',
      avatar:
        'https://avatars0.githubusercontent.com/u/42513619?s=400&u=d878f4532bb5749979e18f3696b8985b90e9f78b&v=4',
    })

    expect(loggerMock.getIndiscriminateAll()).toMatchSnapshot()
    loggerMock.restore()
  })

  test('init', function () {
    const dateChalk = colorToChalk([25, 104, 179], false)
    const nameChalk = colorToChalk([25, 104, 179], true)
    const logger = new Logger({
      name: 'complex',
      mode: 'normal',
      level: DEBUG,
      inline: false,
      colorful: true,
      date: true,
      dateChalk,
      nameChalk,
    })

    expect(logger.name).toBe('complex')
    expect(logger.mode).toBe('normal')
    expect(logger.level).toBe(DEBUG)
    expect(logger.flags.inline).toBe(false)
    expect(logger.flags.colorful).toBe(true)
    expect(logger.flags.date).toBe(true)
    expect(logger.dateChalk).toBe(dateChalk)
    expect(logger.nameChalk).toBe(nameChalk)

    logger.init({
      name: 'waw',
      mode: 'loose',
      level: VERBOSE,
      inline: true,
      colorful: false,
    })

    expect(logger.name).toBe('waw')
    expect(logger.mode).toBe('loose')
    expect(logger.level).toBe(VERBOSE)
    expect(logger.flags.inline).toBe(true)
    expect(logger.flags.colorful).toBe(false)
    expect(logger.flags.date).toBe(true)
    expect(logger.dateChalk).toBe(dateChalk)
    expect(logger.nameChalk).toBe(nameChalk)
  })
})
