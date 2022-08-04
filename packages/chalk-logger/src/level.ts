import { ColorfulChalk } from './color'

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
  header: ColorfulChalk
  content: ColorfulChalk
}

export type ILevelStyleMap = Record<Level, ILevelStyle>

export const defaultLevelStyleMap: ILevelStyleMap = Object.freeze({
  [Level.DEBUG]: {
    title: 'debug',
    header: new ColorfulChalk('#BCA21F'),
    content: new ColorfulChalk('#BCA21F'),
  },
  [Level.VERBOSE]: {
    title: 'verb ',
    header: new ColorfulChalk('#72C9CC'),
    content: new ColorfulChalk('#72C9CC'),
  },
  [Level.INFO]: {
    title: 'info ',
    header: new ColorfulChalk('#00FF00'),
    content: new ColorfulChalk('#00FF00'),
  },
  [Level.WARN]: {
    title: 'warn ',
    header: new ColorfulChalk('#FFA195'),
    content: new ColorfulChalk('#FFA195'),
  },
  [Level.ERROR]: {
    title: 'error',
    header: new ColorfulChalk('red'),
    content: new ColorfulChalk('red'),
  },
  [Level.FATAL]: {
    title: 'fatal',
    header: new ColorfulChalk('black', 'red'),
    content: new ColorfulChalk('redBright'),
  },
})

export const resolveLevel = (level: string): Level | null => {
  switch (level.toLowerCase()) {
    case 'debug':
      return Level.DEBUG
    case 'verbo':
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
    default:
      return null
  }
}
