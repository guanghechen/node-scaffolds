// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import { Reporter, ReporterLevelEnum } from '@guanghechen/reporter'

export const reporter = new Reporter(
  chalk,
  {
    baseName: 'rollup-plugin-copy',
    level: ReporterLevelEnum.INFO,
    flights: {
      date: false,
      colorful: true,
    },
  },
  process.argv,
)
