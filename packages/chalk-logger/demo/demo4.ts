import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const logFilepath = path.resolve(__dirname, 'orz.log')
const logger = new ChalkLogger(
  {
    name: 'demo4',
    level: Level.DEBUG, // the default value is DEBUG
    flights: {
      date: true, // the default value is false.
      inline: true,
      colorful: false, // the default value is true.
    },
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
