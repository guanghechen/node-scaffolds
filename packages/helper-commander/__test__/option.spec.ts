import ChalkLogger, { DEBUG } from '@guanghechen/chalk-logger'
import { resolveCommandConfigurationOptions } from '@guanghechen/helper-commander'
import { createLoggerMock } from '@guanghechen/helper-jest'
import { desensitize, locateFixtures } from 'jest.helper'

describe('resolveCommandConfigurationOptions', function () {
  const logger = new ChalkLogger({ level: DEBUG, colorful: false })
  const loggerMock = createLoggerMock({ logger, desensitize })

  beforeEach(() => loggerMock.reset())
  afterAll(() => loggerMock.restore())

  test('basic', function () {
    expect(
      desensitize(
        resolveCommandConfigurationOptions(
          logger,
          '@guanghechen/tool-demo',
          'init',
          locateFixtures('basic2'),
          {
            logLevel: 'info',
            workspace: locateFixtures('basic2'),
            configPath: [locateFixtures('basic2/demo.config.yml')],
            color: true,
            date: false,
            a: [1, 2, 3],
          },
          {
            color: false,
            date: true,
            a: [4, 5],
          },
        ),
      ),
    ).toMatchSnapshot()
    expect(loggerMock.getIndiscriminateAll()).toMatchSnapshot()
  })

  test('with config', function () {
    expect(
      desensitize(
        resolveCommandConfigurationOptions(
          logger,
          '@guanghechen/tool-demo',
          'generate',
          locateFixtures('basic2'),
          {
            logLevel: 'info',
            workspace: locateFixtures('basic2'),
            color: true,
            date: false,
            a: [1, 2, 3],
          },
          {
            color: false,
            date: true,
            a: [4, 5],
          },
        ),
      ),
    ).toMatchSnapshot()
    expect(loggerMock.getIndiscriminateAll()).toMatchSnapshot()
  })

  test('no sub-command', function () {
    expect(
      desensitize(
        resolveCommandConfigurationOptions(
          logger,
          '@guanghechen/tool-demo',
          false,
          locateFixtures('basic2'),
          {
            logLevel: 'warn',
            workspace: locateFixtures('basic2'),
            color: true,
            date: false,
            a: [1, 2, 3],
          },
          {
            color: false,
            date: true,
            a: [4, 5],
          },
        ),
      ),
    ).toMatchSnapshot()
    expect(loggerMock.getIndiscriminateAll()).toMatchSnapshot()
  })
})
