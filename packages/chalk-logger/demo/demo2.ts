import { ChalkLogger, Level } from '@guanghechen/chalk-logger'

const logger = new ChalkLogger(
  {
    name: 'demo2',
    level: Level.ERROR, // the default value is INFO
    flights: {
      date: false, // the default value is false.
      colorful: true, // the default value is true.
    },
  },
  process.argv,
)

logger.formatHeader = function formatHeader(level: Level, date: Date): string {
  const dateText: string = this.flights.date
    ? this.formatContent(level, date.toLocaleTimeString())
    : ''

  const levelStyle = this.levelStyleMap[level]
  let levelText = levelStyle.title
  if (this.flights.colorful) {
    levelText = levelStyle.labelChalk.fg(levelText)
    if (levelStyle.labelChalk.bg != null) levelText = levelStyle.labelChalk.bg(levelText)
  }

  const titleText: string = this.flights.title
    ? this.formatContent(level, '<' + this.name + '>')
    : ''

  let result = ''
  if (dateText) result += dateText + ' '
  result += levelText
  if (titleText) result += ' ' + titleText
  return result
}

logger.debug('A', 'B', 'C')
logger.verbose('A', 'B', 'C')
logger.info('a', 'b', 'c')
logger.warn('X', 'Y', 'Z', { a: 1, b: 2 })
logger.error('x', 'y', 'z', { c: { a: 'hello' }, b: { d: 'world' } })
logger.fatal('1', '2', '3')
