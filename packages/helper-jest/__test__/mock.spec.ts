import { createConsoleMock, createReporterMock } from '../src'

describe('ConsoleMock', function () {
  test('basic', function () {
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

  test('reset', function () {
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

  test('with desensitize', function () {
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
  const reporter = {
    write: (text: string): void => void process.stdout.write('waw-' + text),
  }

  test('basic', function () {
    const mock = createReporterMock({ reporter })
    reporter.write('reporter waw0')
    console.debug('debug waw1')
    console.log('log waw2')
    console.info('info waw3')
    console.error('error waw4')
    reporter.write('reporter waw5')

    expect(mock.getIndiscriminateAll()).toEqual([
      ['reporter waw0'],
      ['debug waw1'],
      ['log waw2'],
      ['info waw3'],
      ['error waw4'],
      ['reporter waw5'],
    ])

    mock.restore()
  })

  test('spy reporter only', function () {
    const mock = createReporterMock({ reporter, spyOnGlobalConsole: false })
    reporter.write('reporter waw0')
    console.debug('debug waw1')
    console.log('log waw2')
    console.info('info waw3')
    console.error('error waw4')
    reporter.write('reporter waw5')

    expect(mock.getIndiscriminateAll()).toEqual([['reporter waw0'], ['reporter waw5']])

    mock.restore()
  })

  test('rest', function () {
    const mock = createReporterMock({ reporter })

    reporter.write('reporter waw0')
    console.debug('debug waw1')
    expect(mock.getIndiscriminateAll()).toEqual([['reporter waw0'], ['debug waw1']])

    console.log('log waw2')
    expect(mock.getIndiscriminateAll()).toEqual([['reporter waw0'], ['debug waw1'], ['log waw2']])

    // reset mock
    mock.reset()

    console.info('info waw3')
    console.error('error waw4')
    reporter.write('reporter waw5')
    expect(mock.getIndiscriminateAll()).toEqual([['info waw3'], ['error waw4'], ['reporter waw5']])

    mock.restore()
  })

  test('with desensitize', function () {
    const mock = createReporterMock({
      reporter,
      desensitize: args => args.map(arg => 'ghc: ' + arg),
    })

    reporter.write('reporter waw0')
    console.debug('debug waw1')
    console.log('log waw2')
    console.info('info waw3')
    console.error('error waw4')
    reporter.write('reporter waw5')

    expect(mock.getIndiscriminateAll()).toEqual([
      ['ghc: reporter waw0'],
      ['ghc: debug waw1'],
      ['ghc: log waw2'],
      ['ghc: info waw3'],
      ['ghc: error waw4'],
      ['ghc: reporter waw5'],
    ])

    mock.restore()
  })
})
