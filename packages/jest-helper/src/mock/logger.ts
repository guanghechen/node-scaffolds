import { noop } from '../util'
import type { ConsoleMethodField } from './console'

/**
 * Shape of a logger.
 */
interface Logger {
  /**
   * Output something into stdout or files.
   * @param text
   */
  write(text: string): void | Promise<void>
}

interface CreateLoggerMockOptions {
  /**
   * The logger to be spied.
   */
  logger: Logger
  /**
   * Whether to also monitor global.console
   * @default true
   */
  spyOnGlobalConsole?: boolean
  /**
   * The list of method names of the console to be monitored, which will take
   * effect only when `spyOnGlobalConsole` is specified true.
   * @default ['debug', 'log', 'info', 'warn', 'error']
   */
  consoleMethods?: ReadonlyArray<ConsoleMethodField>
  /**
   * Remove sensitive data from the value to be output.
   * @default noop
   */
  desensitize?(args: ReadonlyArray<unknown>): unknown[]
}

/**
 * A object encapsulated some mock functions of console.
 */
export interface LoggerMock {
  /**
   * Get all of passed args to logger and all spied methods of console.
   * @param methodName
   */
  getIndiscriminateAll(): ReadonlyArray<ReadonlyArray<unknown>>
  /**
   * Reset inner states.
   */
  reset(): void
  /**
   * Restore mock functions.
   */
  restore(): void
}

/**
 * Create a ConsoleMock.
 * @param methodNames
 * @returns
 */
export function createLoggerMock(options: CreateLoggerMockOptions): LoggerMock {
  const {
    logger,
    consoleMethods = ['debug', 'log', 'info', 'warn', 'error'],
    spyOnGlobalConsole = true,
    desensitize = noop,
  } = options

  const logData: unknown[][] = []
  const collectLog = (...args: any[]): void => {
    const data = desensitize(args)
    logData.push(data)
  }

  // mock logger
  const writeMock: jest.MockInstance<any, any> = jest
    .spyOn(logger, 'write')
    .mockImplementation(collectLog)

  const consoleMockFnMap: Record<
    ConsoleMethodField,
    jest.MockInstance<any, any>
  > = {} as any
  if (spyOnGlobalConsole) {
    for (const field of consoleMethods) {
      consoleMockFnMap[field] = jest
        .spyOn(console, field)
        .mockImplementation((...args: unknown[]) => {
          const data = desensitize(args)
          logData.push(data)
        })
    }
  }

  return {
    getIndiscriminateAll: () => logData.slice(),
    reset: () => {
      logData.splice(0, logData.length)
    },
    restore: () => {
      if (writeMock != null) writeMock.mockRestore()
      if (spyOnGlobalConsole) {
        for (const field of consoleMethods)
          consoleMockFnMap[field].mockRestore()
      }
    },
  }
}
