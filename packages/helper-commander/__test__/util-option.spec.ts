import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import { resolveCommandConfigurationOptions } from '@guanghechen/helper-commander'
import { createLoggerMock } from '@guanghechen/helper-jest'
import { desensitize, locateFixtures } from 'jest.helper'

describe('resolveCommandConfigurationOptions', () => {
  const logger = new ChalkLogger({
    level: Level.DEBUG,
    flights: {
      colorful: false,
    },
  })
  const loggerMock = createLoggerMock({ logger, desensitize })

  beforeEach(() => loggerMock.reset())
  afterAll(() => loggerMock.restore())

  test('basic', () => {
    expect(
      desensitize(
        resolveCommandConfigurationOptions({
          commandName: '@guanghechen/tool-demo',
          defaultOptions: {
            logLevel: 'info',
            workspace: locateFixtures('basic2'),
            configPath: [locateFixtures('basic2/demo.config.yml')],
            color: true,
            date: false,
            a: [1, 2, 3],
          },
          logger,
          options: {
            color: false,
            date: true,
            a: [4, 5],
          },
          subCommandName: 'init',
          workspace: locateFixtures('basic2'),
        }),
      ),
    ).toMatchSnapshot()
    expect(loggerMock.getIndiscriminateAll()).toMatchSnapshot()
  })

  test('with config', () => {
    expect(
      desensitize(
        resolveCommandConfigurationOptions({
          commandName: '@guanghechen/tool-demo',
          defaultOptions: {
            logLevel: 'info',
            workspace: locateFixtures('basic2'),
            color: true,
            date: false,
            a: [1, 2, 3],
          },
          logger,
          options: {
            color: false,
            date: true,
            a: [4, 5],
          },
          subCommandName: 'generate',
          workspace: locateFixtures('basic2'),
        }),
      ),
    ).toMatchSnapshot()
    expect(loggerMock.getIndiscriminateAll()).toMatchSnapshot()
  })

  test('no sub-command', () => {
    expect(
      desensitize(
        resolveCommandConfigurationOptions({
          commandName: '@guanghechen/tool-demo',
          defaultOptions: {
            logLevel: 'warn',
            workspace: locateFixtures('basic2'),
            color: true,
            date: false,
            a: [1, 2, 3],
          },
          logger,
          options: {
            color: false,
            date: true,
            a: [4, 5],
          },
          subCommandName: false,
          workspace: locateFixtures('basic2'),
        }),
      ),
    ).toMatchSnapshot()
    expect(loggerMock.getIndiscriminateAll()).toMatchSnapshot()
  })
})
