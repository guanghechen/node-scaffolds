import { createLoggerMock } from '@guanghechen/helper-jest'
import type { ILogger } from '@guanghechen/utility-types'
import { desensitize, locateFixtures } from 'jest.helper'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { ILoggerOptions } from '../src'
import { Level, Logger, resolveLevel } from '../src'

const levels: string[] = ['debug', 'verbose', 'info', 'warn', 'error', 'fatal']
const methods: Array<keyof ILogger> = ['debug', 'verbose', 'info', 'warn', 'error', 'fatal']

describe('Logger', () => {
  for (const mode of ['normal', 'loose']) {
    for (const level of levels) {
      for (const shouldInline of [false, true]) {
        for (const shouldColorful of [false, true]) {
          for (const shouldDate of [false, true]) {
            for (const shouldTitle of [false, true]) {
              const options: ILoggerOptions = {
                mode: mode as 'normal' | 'loose',
                level: resolveLevel(level),
                flights: {
                  inline: shouldInline,
                  colorful: shouldColorful,
                  date: shouldDate,
                  title: shouldTitle,
                },
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
                  log('{}, {}, {}, {}, {}, {}, {}', 1, 'ooo', null, true, false, undefined, 'a\nb')
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

describe('customize', () => {
  const workspaceDir: string = locateFixtures('__fictitious__Logger_customize')

  beforeEach(async () => {
    if (existsSync(workspaceDir)) {
      await fs.rm(workspaceDir, { recursive: true })
    }
    await fs.mkdir(workspaceDir, { recursive: true })
  })
  afterEach(async () => {
    if (existsSync(workspaceDir)) {
      await fs.rm(workspaceDir, { recursive: true })
    }
  })

  test('custom +placeholderRegex', () => {
    const logger = new Logger({
      name: 'complex',
      mode: 'normal',
      level: Level.DEBUG,
      flights: {
        inline: false,
        colorful: false,
        date: true,
      },
      placeholderRegex: /(?<!\\)<>/g, // change placeholder of string format
    })
    const loggerMock = createLoggerMock({ logger, desensitize })

    const log = logger.debug.bind(logger)
    log('{}, {}, {}, {}, {}, {}, {}', 1, 'ooo', null, true, false, undefined, () => 'a\nb\n')
    log('<>, <>, <>, <>, <>, <>, <>', 1, 'ooo', null, true, false, undefined, () => 'a\nb\n')
    log('user(<>)', {
      username: 'lemon-clown',
      avatar:
        'https://avatars0.githubusercontent.com/u/42513619?s=400&u=d878f4532bb5749979e18f3696b8985b90e9f78b&v=4',
    })

    // Error is hard to test
    log('bad argument (<>). error({})', { username: 123 }, new Error('username is invalid').message)

    log('a: {}, b: {}', 1, 2, 3)

    expect(loggerMock.getIndiscriminateAll()).toMatchSnapshot()
    loggerMock.restore()
  })

  test('init', () => {
    const logger = new Logger({
      name: 'complex',
      mode: 'normal',
      level: Level.DEBUG,
      flights: {
        inline: false,
        colorful: true,
        date: true,
      },
    })

    expect(logger.name).toBe('complex')
    expect(logger.mode).toBe('normal')
    expect(logger.level).toBe(Level.DEBUG)
    expect(logger.flights.inline).toBe(false)
    expect(logger.flights.colorful).toBe(true)
    expect(logger.flights.date).toBe(true)

    logger.init({
      name: 'waw',
      mode: 'loose',
      level: Level.VERBOSE,
      flights: {
        inline: true,
        colorful: false,
      },
    })

    expect(logger.name).toBe('waw')
    expect(logger.mode).toBe('loose')
    expect(logger.level).toBe(Level.VERBOSE)
    expect(logger.flights.inline).toBe(true)
    expect(logger.flights.colorful).toBe(false)
    expect(logger.flights.date).toBe(true)
  })

  test('log error', () => {
    const logger = new Logger({
      name: 'waw',
      level: Level.DEBUG,
      flights: {
        inline: false,
        colorful: true,
        date: true,
      },
    })
    const loggerMock = createLoggerMock({ logger, desensitize })

    logger.error(new Error('waw!'))
    expect(loggerMock.getIndiscriminateAll().length).toEqual(1)
    expect(/Error: waw!/.test(loggerMock.getIndiscriminateAll()[0][0] as string)).toEqual(true)
  })

  test('out to file', async () => {
    const encoding: BufferEncoding = 'utf8'
    const logFilepath = path.resolve(workspaceDir, 'log.txt')
    const write = (text: string): void => {
      appendFileSync(logFilepath, text, encoding)
    }

    const logger = new Logger({
      name: 'file',
      level: Level.DEBUG,
      write,
      flights: {
        inline: false,
        colorful: false,
        date: false,
      },
    })

    logger.info('waw!')
    logger.verbose('Hello {}!', 'Tom')
    expect(readFileSync(logFilepath, encoding)).toEqual(
      ['info  [file] waw!', 'verb  [file] Hello Tom!'].map(x => x + '\n').join(''),
    )
  })
})
