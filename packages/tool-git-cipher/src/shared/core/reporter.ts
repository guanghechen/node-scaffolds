import { ChalkLogger } from '@guanghechen/chalk-logger'
import { COMMAND_NAME } from './constant'

export const reporter = new ChalkLogger(
  {
    name: COMMAND_NAME,
    flights: {
      colorful: true,
      date: false,
      inline: true,
      title: true,
    },
  },
  process.argv,
)
