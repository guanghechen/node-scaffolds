import { ChalkLogger, Level } from '@guanghechen/chalk-logger'

const logger = new ChalkLogger(
  {
    name: 'demo6',
    level: Level.DEBUG,
    flags: {
      date: true,
      colorful: true,
      inline: true,
    },
  },
  process.argv,
)

logger.verbose('user({})', {
  username: 'lemon-clown',
  avatar:
    'https://avatars0.githubusercontent.com/u/42513619?s=400&u=d878f4532bb5749979e18f3696b8985b90e9f78b&v=4',
})
logger.error('bad argument ({}). error({})', { username: 123 }, new Error('username is invalid'))

const logger2 = new ChalkLogger(
  {
    name: 'demo6',
    level: Level.DEBUG,
    flags: {
      date: true,
      colorful: true,
      inline: true,
    },
    placeholderRegex: /(?<!\\)<>/g, // change placeholder of string format
  },
  process.argv,
)

logger2.verbose('user(<>)', {
  username: 'lemon-clown',
  avatar:
    'https://avatars0.githubusercontent.com/u/42513619?s=400&u=d878f4532bb5749979e18f3696b8985b90e9f78b&v=4',
})
logger2.error('bad argument (<>). error({})', { username: 123 }, new Error('username is invalid'))
