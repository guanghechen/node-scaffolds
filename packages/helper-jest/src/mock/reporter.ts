import type { IReporter, ReporterLevelEnum } from '@guanghechen/reporter.types'
import { identity } from '@guanghechen/std'
import { jest } from '@jest/globals'
import type { MockInstance } from 'jest-mock'
import type { IConsoleMethodField } from './console'

interface ICreateReporterMockOptions {
  /**
   * The reporter to be spied.
   */
  reporter: IReporter
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
  consoleMethods?: ReadonlyArray<IConsoleMethodField>
  /**
   * Remove sensitive data from the value to be output.
   * @default identity
   */
  desensitize?(args: ReadonlyArray<unknown>): unknown[]
}

/**
 * A object encapsulated some mock functions of console.
 */
export interface IReporterMock {
  /**
   * Get all of passed args to reporter and all spied methods of console.
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
 * @param options
 * @returns
 */
export function createReporterMock(options: ICreateReporterMockOptions): IReporterMock {
  const {
    reporter,
    consoleMethods = ['debug', 'log', 'info', 'warn', 'error'],
    spyOnGlobalConsole = true,
    desensitize = identity,
  } = options

  // mock reporter
  const logData: unknown[][] = []
  const logMock: MockInstance<any> = jest
    .spyOn(reporter, 'log')
    .mockImplementation(
      (level: ReporterLevelEnum, messageFormat: string | unknown, messages: unknown[]): void => {
        const args: unknown[] = desensitize(messages)
        const text: string | undefined = reporter.format(level, messageFormat, args)
        if (text !== undefined) logData.push(desensitize([text]))
      },
    )

  const consoleMockFnMap: Record<IConsoleMethodField, MockInstance<any>> = {} as any
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
      if (logMock != null) logMock.mockRestore()
      if (spyOnGlobalConsole) {
        for (const field of consoleMethods) consoleMockFnMap[field].mockRestore()
      }
    },
  }
}
