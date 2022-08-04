import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'

const logFilepath = path.resolve(__dirname, 'orz.log')
const logger = new ChalkLogger(
  {
    name: 'demo4',
    level: Level.DEBUG, // the default value is DEBUG
    flags: {
      date: true, // the default value is false.
      inline: true,
      colorful: false, // the default value is true.
    },
    dateChalk: 'green',
    nameChalk: chalk.cyan.bind(chalk),
    write: text => fs.appendFileSync(logFilepath, text, 'utf-8'),
  },
  process.argv,
)

logger.debug('A', 'B', 'C')
logger.verbose('A', 'B', 'C')
logger.info('a', 'b', 'c')
logger.warn('X', 'Y', 'Z', { a: 1, b: 2 })
logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
logger.fatal('1', '2', '3')
