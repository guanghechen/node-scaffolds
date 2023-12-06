// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import { type IReporter, Reporter } from '@guanghechen/reporter'
import { COMMAND_NAME } from './constant'

export const reporter: IReporter = new Reporter(
  chalk,
  {
    baseName: COMMAND_NAME,
    flights: {
      date: true,
    },
  },
  process.argv,
)
