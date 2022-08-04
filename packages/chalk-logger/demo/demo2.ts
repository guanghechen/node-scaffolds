import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import chalk from 'chalk'

const logger = new ChalkLogger(
  {
    name: 'demo2',
    level: Level.ERROR, // the default value is INFO
    flags: {
      date: false, // the default value is false.
      colorful: true, // the default value is true.
    },
  },
  process.argv,
)

logger.formatHeader = function (level: Level, date: Date): string {
  const levelStyle = this.levelStyleMap[level]
  let desc = levelStyle.title
  let { name } = this
  if (this.flags.colorful) {
    desc = levelStyle.header.fg(desc)
    if (levelStyle.header.bg != null) desc = levelStyle.header.bg(desc)
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
