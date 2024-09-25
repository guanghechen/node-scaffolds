import { identity } from '@guanghechen/std'
import { jest } from '@jest/globals'
import type { MockInstance } from 'jest-mock'

/**
 * Method names of console
 */
export type IConsoleMethodField = 'debug' | 'log' | 'info' | 'warn' | 'error'

/**
 * A object encapsulated some mock functions of console.
 */
export interface IConsoleMock {
  /**
   * Get all of passed args to the specified console method
   * @param methodName
   */
  get(methodName: IConsoleMethodField): ReadonlyArray<ReadonlyArray<unknown>>
  /**
   * Get all of passed args to all of the console methods.
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
export function createConsoleMock(
  methodNames: ReadonlyArray<IConsoleMethodField> = ['debug', 'log', 'info', 'warn', 'error'],
  desensitize: (args: unknown[]) => unknown[] = identity<unknown[]>,
): IConsoleMock {
  const mockFnMap: Record<IConsoleMethodField, MockInstance<any>> = {} as any
  const allData: unknown[][] = []
  const dataMap: Record<IConsoleMethodField, unknown[][]> = {} as any

  for (const field of methodNames) {
    dataMap[field] = []
    mockFnMap[field] = jest.spyOn(console, field).mockImplementation((...args: unknown[]) => {
      const data = desensitize(args)
      dataMap[field].push(data)
      allData.push(data)
    })
  }

  return {
    get: field => dataMap[field].slice(),
    getIndiscriminateAll: () => allData.slice(),
    reset: () => {
      allData.splice(0, allData.length)
      for (const field of methodNames) dataMap[field] = []
    },
    restore: () => {
      for (const field of methodNames) mockFnMap[field].mockRestore()
    },
  }
}
