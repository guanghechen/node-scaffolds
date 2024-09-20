// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import { resolveCommandConfigurationOptions } from '@guanghechen/helper-commander'
import { createReporterMock } from '@guanghechen/helper-jest'
import { Reporter, ReporterLevelEnum } from '@guanghechen/reporter'
import { desensitize, locateFixtures } from 'jest.helper'

describe('resolveCommandConfigurationOptions', () => {
  const reporter = new Reporter(chalk, {
    level: ReporterLevelEnum.DEBUG,
    flights: { colorful: false },
  })
  const reporterMock = createReporterMock({ reporter, desensitize })

  beforeEach(() => reporterMock.reset())
  afterAll(() => reporterMock.restore())

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
          reporter,
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
    expect(reporterMock.getIndiscriminateAll()).toMatchSnapshot()
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
          reporter,
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
    expect(reporterMock.getIndiscriminateAll()).toMatchSnapshot()
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
          reporter,
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
    expect(reporterMock.getIndiscriminateAll()).toMatchSnapshot()
  })
})
