// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import { Reporter, ReporterLevelEnum } from '@guanghechen/reporter'
import { createConsoleMock, createReporterMock } from '../src'

describe('ConsoleMock', function () {
  it('basic', function () {
    const mock = createConsoleMock()

    console.debug('debug waw1')
    console.log('log waw2')
    console.info('info waw3')
    console.error('error waw4')

    expect(mock.get('debug')).toEqual([['debug waw1']])
    expect(mock.get('log')).toEqual([['log waw2']])
    expect(mock.get('info')).toEqual([['info waw3']])
    expect(mock.get('error')).toEqual([['error waw4']])
    expect(mock.getIndiscriminateAll()).toEqual([
      ['debug waw1'],
      ['log waw2'],
      ['info waw3'],
      ['error waw4'],
    ])

    mock.restore()
  })

  it('reset', function () {
    const mock = createConsoleMock()

    console.debug('debug waw1')
    console.log('log waw2')
    expect(mock.get('debug')).toEqual([['debug waw1']])
    expect(mock.get('log')).toEqual([['log waw2']])
    expect(mock.getIndiscriminateAll()).toEqual([['debug waw1'], ['log waw2']])

    mock.reset()
    console.info('info waw3')
    console.error('error waw4')
    expect(mock.get('info')).toEqual([['info waw3']])
    expect(mock.get('error')).toEqual([['error waw4']])
    expect(mock.getIndiscriminateAll()).toEqual([['info waw3'], ['error waw4']])

    mock.restore()
  })

  it('with desensitize', function () {
    const mock = createConsoleMock(undefined, args => args.map(arg => 'ghc: ' + arg))

    console.debug('debug waw1')
    console.log('log waw2')
    console.info('info waw3')
    console.error('error waw4')

    expect(mock.get('debug')).toEqual([['ghc: debug waw1']])
    expect(mock.get('log')).toEqual([['ghc: log waw2']])
    expect(mock.get('info')).toEqual([['ghc: info waw3']])
    expect(mock.get('error')).toEqual([['ghc: error waw4']])
    expect(mock.getIndiscriminateAll()).toEqual([
      ['ghc: debug waw1'],
      ['ghc: log waw2'],
      ['ghc: info waw3'],
      ['ghc: error waw4'],
    ])

    mock.restore()
  })
})

describe('LoggerMock', function () {
  const reporter = new Reporter(chalk, {
    baseName: 'mock',
    level: ReporterLevelEnum.VERBOSE,
    flights: { colorful: false },
  })

  it('basic', function () {
    const mock = createReporterMock({ reporter })
    reporter.info('reporter waw0')
    console.debug('debug waw1')
    console.log('log waw2')
    console.info('info waw3')
    console.error('error waw4')
    reporter.info('reporter waw5')

    expect(mock.getIndiscriminateAll()).toEqual([
      ['info  [mock] reporter waw0\n'],
      ['debug waw1'],
      ['log waw2'],
      ['info waw3'],
      ['error waw4'],
      ['info  [mock] reporter waw5\n'],
    ])

    mock.restore()
  })

  it('spy reporter only', function () {
    const mock = createReporterMock({ reporter, spyOnGlobalConsole: false })
    reporter.info('reporter waw0')
    console.debug('debug waw1')
    console.log('log waw2')
    console.info('info waw3')
    console.error('error waw4')
    reporter.info('reporter waw5')

    expect(mock.getIndiscriminateAll()).toEqual([
      ['info  [mock] reporter waw0\n'],
      ['info  [mock] reporter waw5\n'],
    ])

    mock.restore()
  })

  it('rest', function () {
    const mock = createReporterMock({ reporter })

    reporter.info('reporter waw0')
    console.debug('debug waw1')
    expect(mock.getIndiscriminateAll()).toEqual([['info  [mock] reporter waw0\n'], ['debug waw1']])

    console.log('log waw2')
    expect(mock.getIndiscriminateAll()).toEqual([
      ['info  [mock] reporter waw0\n'],
      ['debug waw1'],
      ['log waw2'],
    ])

    // reset mock
    mock.reset()

    console.info('info waw3')
    console.error('error waw4')
    reporter.info('reporter waw5')
    expect(mock.getIndiscriminateAll()).toEqual([
      ['info waw3'],
      ['error waw4'],
      ['info  [mock] reporter waw5\n'],
    ])

    mock.restore()
  })

  it('with desensitize', function () {
    const mock = createReporterMock({
      reporter,
      desensitize: args => args.map(arg => 'ghc: ' + arg),
    })

    reporter.info('reporter {}', 'waw0')
    console.debug('debug waw1')
    console.log('log waw2')
    console.info('info waw3')
    console.error('error waw4')
    reporter.info('reporter {}', 'waw5')

    expect(mock.getIndiscriminateAll()).toEqual([
      ['info  [mock] reporter ghc: waw0\n'],
      ['ghc: debug waw1'],
      ['ghc: log waw2'],
      ['ghc: info waw3'],
      ['ghc: error waw4'],
      ['info  [mock] reporter ghc: waw5\n'],
    ])

    mock.restore()
  })
})
