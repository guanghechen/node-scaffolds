import { createConsoleMock, createLoggerMock } from '../src'

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
    const mock = createConsoleMock(undefined, args =>
      args.map(arg => 'ghc: ' + arg),
    )

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
  const logger = {
    write: (text: string): void => void process.stdout.write('waw-' + text),
  }

  test('basic', function () {
    const mock = createLoggerMock({ logger })
    logger.write('logger waw0')
    console.debug('debug waw1')
    console.log('log waw2')
    console.info('info waw3')
    console.error('error waw4')
    logger.write('logger waw5')

    expect(mock.getIndiscriminateAll()).toEqual([
      ['logger waw0'],
      ['debug waw1'],
      ['log waw2'],
      ['info waw3'],
      ['error waw4'],
      ['logger waw5'],
    ])

    mock.restore()
  })

  test('spy logger only', function () {
    const mock = createLoggerMock({ logger, spyOnGlobalConsole: false })
    logger.write('logger waw0')
    console.debug('debug waw1')
    console.log('log waw2')
    console.info('info waw3')
    console.error('error waw4')
    logger.write('logger waw5')

    expect(mock.getIndiscriminateAll()).toEqual([
      ['logger waw0'],
      ['logger waw5'],
    ])

    mock.restore()
  })

  test('rest', function () {
    const mock = createLoggerMock({ logger })

    logger.write('logger waw0')
    console.debug('debug waw1')
    expect(mock.getIndiscriminateAll()).toEqual([
      ['logger waw0'],
      ['debug waw1'],
    ])

    console.log('log waw2')
    expect(mock.getIndiscriminateAll()).toEqual([
      ['logger waw0'],
      ['debug waw1'],
      ['log waw2'],
    ])

    // reset mock
    mock.reset()

    console.info('info waw3')
    console.error('error waw4')
    logger.write('logger waw5')
    expect(mock.getIndiscriminateAll()).toEqual([
      ['info waw3'],
      ['error waw4'],
      ['logger waw5'],
    ])

    mock.restore()
  })

  test('with desensitize', function () {
    const mock = createLoggerMock({
      logger,
      desensitize: args => args.map(arg => 'ghc: ' + arg),
    })

    logger.write('logger waw0')
    console.debug('debug waw1')
    console.log('log waw2')
    console.info('info waw3')
    console.error('error waw4')
    logger.write('logger waw5')

    expect(mock.getIndiscriminateAll()).toEqual([
      ['ghc: logger waw0'],
      ['ghc: debug waw1'],
      ['ghc: log waw2'],
      ['ghc: info waw3'],
      ['ghc: error waw4'],
      ['ghc: logger waw5'],
    ])

    mock.restore()
  })
})
