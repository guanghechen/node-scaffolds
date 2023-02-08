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
  labelChalk: ColorfulChalk
  contentChalk: ColorfulChalk
}

export type ILevelStyleMap = Record<Level, ILevelStyle>

export const defaultLevelStyleMap: ILevelStyleMap = Object.freeze({
  [Level.DEBUG]: {
    title: 'debug',
    labelChalk: new ColorfulChalk('grey'),
    contentChalk: new ColorfulChalk('grey'),
  },
  [Level.VERBOSE]: {
    title: 'verb',
    labelChalk: new ColorfulChalk('cyan'),
    contentChalk: new ColorfulChalk('cyan'),
  },
  [Level.INFO]: {
    title: 'info',
    labelChalk: new ColorfulChalk('green'),
    contentChalk: new ColorfulChalk('green'),
  },
  [Level.WARN]: {
    title: 'warn',
    labelChalk: new ColorfulChalk('yellow'),
    contentChalk: new ColorfulChalk('yellow'),
  },
  [Level.ERROR]: {
    title: 'error',
    labelChalk: new ColorfulChalk('red'),
    contentChalk: new ColorfulChalk('red'),
  },
  [Level.FATAL]: {
    title: 'fatal',
    labelChalk: new ColorfulChalk('black', 'red'),
    contentChalk: new ColorfulChalk('redBright'),
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
    default:
      return null
  }
}
