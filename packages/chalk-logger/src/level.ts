import chalk from 'chalk'
import type { ChalkInstance } from 'chalk'

export enum Level {
  DEBUG = 'debug',
  VERBOSE = 'verbose',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export const DEBUG = Level.DEBUG
export const VERBOSE = Level.VERBOSE
export const INFO = Level.INFO
export const WARN = Level.WARN
export const ERROR = Level.ERROR
export const FATAL = Level.FATAL

export interface ColorfulChalk {
  readonly fg: ChalkInstance
  readonly bg: ChalkInstance | null
}

export const levelOrdinalMap: Record<Level, number> = {
  [Level.DEBUG]: 1,
  [Level.VERBOSE]: 2,
  [Level.INFO]: 3,
  [Level.WARN]: 4,
  [Level.ERROR]: 5,
  [Level.FATAL]: 6,
}

export interface ILevelStyle {
  title: string
  labelChalk: ColorfulChalk
  contentChalk: ColorfulChalk
}

export type ILevelStyleMap = Record<Level, ILevelStyle>

export const defaultLevelStyleMap: ILevelStyleMap = Object.freeze({
  [Level.DEBUG]: {
    title: 'debug',
    labelChalk: { fg: chalk.grey, bg: null },
    contentChalk: { fg: chalk.grey, bg: null },
  },
  [Level.VERBOSE]: {
    title: 'verb ',
    labelChalk: { fg: chalk.cyan, bg: null },
    contentChalk: { fg: chalk.cyan, bg: null },
  },
  [Level.INFO]: {
    title: 'info ',
    labelChalk: { fg: chalk.green, bg: null },
    contentChalk: { fg: chalk.green, bg: null },
  },
  [Level.WARN]: {
    title: 'warn ',
    labelChalk: { fg: chalk.yellow, bg: null },
    contentChalk: { fg: chalk.yellow, bg: null },
  },
  [Level.ERROR]: {
    title: 'error',
    labelChalk: { fg: chalk.red, bg: null },
    contentChalk: { fg: chalk.red, bg: null },
  },
  [Level.FATAL]: {
    title: 'fatal',
    labelChalk: { fg: chalk.black, bg: chalk.bgRed },
    contentChalk: { fg: chalk.redBright, bg: null },
  },
})

export const resolveLevel = (level: string): Level | null => {
  switch (level.toLowerCase()) {
    case 'debug':
      return Level.DEBUG
    case 'verb':
    case 'verbose':
      return Level.VERBOSE
    case 'info':
    case 'information':
      return Level.INFO
    case 'warn':
    case 'warning':
      return Level.WARN
    case 'error':
      return Level.ERROR
    case 'fatal':
      return Level.FATAL
    /* c8 ignore start */
    default:
      return null
    /* c8 ignore end */
  }
}
