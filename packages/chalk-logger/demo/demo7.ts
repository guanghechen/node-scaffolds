import { ChalkLogger, Level } from '@guanghechen/chalk-logger'

const logger = new ChalkLogger(
  {
    name: 'demo7',
    level: Level.DEBUG,
    flags: {
      date: true,
      title: false,
      colorful: true,
      inline: true,
    },
  },
  process.argv,
)

logger.debug('A', 'B', 'C')
logger.verbose('A', 'B', 'C')
logger.info('a', 'b', 'c')
logger.warn('X', 'Y', 'Z', { a: 1, b: 2 })
logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
logger.fatal('1', '2', '3')

const logger2 = new ChalkLogger(
  {
    name: 'demo7',
    level: Level.DEBUG,
    flags: {
      date: false,
      title: false,
      colorful: true,
      inline: true,
    },
    placeholderRegex: /(?<!\\)<>/g, // change placeholder of string format
  },
  process.argv,
)

logger2.debug('A', 'B', 'C')
logger2.verbose('A', 'B', 'C')
logger2.info('a', 'b', 'c')
logger2.warn('X', 'Y', 'Z', { a: 1, b: 2 })
logger2.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
logger2.fatal('1', '2', '3')
