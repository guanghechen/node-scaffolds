import type { Level } from '@guanghechen/chalk-logger'
import { ChalkLogger, ERROR } from '@guanghechen/chalk-logger'
import chalk from 'chalk'

const logger = new ChalkLogger(
  {
    name: 'demo2',
    level: ERROR, // the default value is INFO
    date: false, // the default value is false.
    colorful: true, // the default value is true.
  },
  process.argv,
)

logger.formatHeader = function (level: Level, date: Date): string {
  let { desc } = level
  let { name } = this
  if (this.flags.colorful) {
    desc = level.headerChalk.fg(desc)
    if (level.headerChalk.bg != null) desc = level.headerChalk.bg(desc)
    name = chalk.gray(name)
  }
  const header = `${desc} ${name}`
  if (!this.flags.date) return `[${header}]`

  let dateString = date.toLocaleTimeString()
  if (this.flags.colorful) dateString = chalk.gray(dateString)
  return `<${dateString} ${header}>`
}

logger.debug('A', 'B', 'C')
logger.verbose('A', 'B', 'C')
logger.info('a', 'b', 'c')
logger.warn('X', 'Y', 'Z', { a: 1, b: 2 })
logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
logger.fatal('1', '2', '3')
