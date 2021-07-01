import ChalkLogger from '@guanghechen/chalk-logger'
import { COMMAND_NAME } from './constant'

export const logger = new ChalkLogger(
  {
    name: COMMAND_NAME,
    date: true,
  },
  process.argv,
)
