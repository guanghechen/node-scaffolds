import { ReporterLevelEnum } from '@guanghechen/reporter.types'
import { ChalkLogger } from './chalk-logger'

export * from './chalk-logger'
export * from './commander'
export * from './level'
export * from './logger'

// For compatible.
export type Level = ReporterLevelEnum
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Level = ReporterLevelEnum
export const DEBUG = Level.DEBUG
export const VERBOSE = Level.VERBOSE
export const INFO = Level.INFO
export const WARN = Level.WARN
export const ERROR = Level.ERROR
export const FATAL = Level.FATAL

export default ChalkLogger
