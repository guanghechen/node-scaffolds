import { noop } from '../util'

/**
 * Method names of console
 */
export type ConsoleMethodField = 'debug' | 'log' | 'info' | 'warn' | 'error'

/**
 * A object encapsulated some mock functions of console.
 */
export interface ConsoleMock {
  /**
   * Get all of passed args to the specified console method
   * @param methodName
   */
  get(methodName: ConsoleMethodField): ReadonlyArray<ReadonlyArray<unknown>>
  /**
   * Get all of passed args to all of the console methods.
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
export function createConsoleMock(
  methodNames: ReadonlyArray<ConsoleMethodField> = [
    'debug',
    'log',
    'info',
    'warn',
    'error',
  ],
  desensitize: (args: ReadonlyArray<unknown>) => unknown[] = noop as any,
): ConsoleMock {
  const mockFnMap: Record<
    ConsoleMethodField,
    jest.MockInstance<any, any>
  > = {} as any
  const allData: unknown[][] = []
  const dataMap: Record<ConsoleMethodField, unknown[][]> = {} as any

  for (const field of methodNames) {
    dataMap[field] = []
    mockFnMap[field] = jest
      .spyOn(console, field)
      .mockImplementation((...args: unknown[]) => {
        const data = desensitize(args)
        dataMap[field].push(data)
        allData.push(data)
      })
  }

  return {
    get: field => dataMap[field],
    getIndiscriminateAll: () => allData,
    reset: () => {
      allData.splice(0, allData.length)
      for (const field of methodNames) dataMap[field] = []
    },
    restore: () => {
      for (const field of methodNames) mockFnMap[field].mockRestore()
    },
  }
}
