import { ReporterLevelEnum } from '@guanghechen/reporter.types'
import chalk from 'chalk'
import type { ChalkInstance } from 'chalk'

export interface ColorfulChalk {
  readonly fg: ChalkInstance
  readonly bg: ChalkInstance | null
}

export interface ILevelStyle {
  title: string
  labelChalk: ColorfulChalk
  contentChalk: ColorfulChalk
}

export type ILevelStyleMap = Record<ReporterLevelEnum, ILevelStyle>

export const defaultLevelStyleMap: ILevelStyleMap = Object.freeze({
  [ReporterLevelEnum.DEBUG]: {
    title: 'debug',
    labelChalk: { fg: chalk.grey, bg: null },
    contentChalk: { fg: chalk.grey, bg: null },
  },
  [ReporterLevelEnum.VERBOSE]: {
    title: 'verb ',
    labelChalk: { fg: chalk.cyan, bg: null },
    contentChalk: { fg: chalk.cyan, bg: null },
  },
  [ReporterLevelEnum.INFO]: {
    title: 'info ',
    labelChalk: { fg: chalk.green, bg: null },
    contentChalk: { fg: chalk.green, bg: null },
  },
  [ReporterLevelEnum.WARN]: {
    title: 'warn ',
    labelChalk: { fg: chalk.yellow, bg: null },
    contentChalk: { fg: chalk.yellow, bg: null },
  },
  [ReporterLevelEnum.ERROR]: {
    title: 'error',
    labelChalk: { fg: chalk.red, bg: null },
    contentChalk: { fg: chalk.red, bg: null },
  },
  [ReporterLevelEnum.FATAL]: {
    title: 'fatal',
    labelChalk: { fg: chalk.black, bg: chalk.bgRed },
    contentChalk: { fg: chalk.redBright, bg: null },
  },
})

const levelSet: Set<ReporterLevelEnum> = new Set<ReporterLevelEnum>([
  ReporterLevelEnum.DEBUG,
  ReporterLevelEnum.VERBOSE,
  ReporterLevelEnum.INFO,
  ReporterLevelEnum.WARN,
  ReporterLevelEnum.ERROR,
  ReporterLevelEnum.FATAL,
])

export const resolveLevel = (level: string | ReporterLevelEnum): ReporterLevelEnum | null => {
  if (typeof level === 'number') {
    if (levelSet.has(level)) return level
    return null
  }

  switch (level.toLowerCase()) {
    case 'debug':
      return ReporterLevelEnum.DEBUG
    case 'verb':
    case 'verbose':
      return ReporterLevelEnum.VERBOSE
    case 'info':
    case 'information':
      return ReporterLevelEnum.INFO
    case 'warn':
    case 'warning':
      return ReporterLevelEnum.WARN
    case 'error':
      return ReporterLevelEnum.ERROR
    case 'fatal':
      return ReporterLevelEnum.FATAL
    /* c8 ignore start */
    default:
      return null
    /* c8 ignore end */
  }
}
