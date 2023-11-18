import type { Mutable } from '@guanghechen/types'
import { parseOptionsFromArgs } from './commander'
import type { ILoggerOptions } from './logger'
import { Logger } from './logger'

export class ChalkLogger extends Logger {
  /**
   * prefix of logger.name
   */
  protected basename: string | null = null
  /**
   * name passed into .setName()
   */
  protected divisionName: string | null = null

  constructor(options?: ILoggerOptions, args?: string[]) {
    const optionsFromArgs = parseOptionsFromArgs(args || [])
    const resolvedOptions = {
      ...options,
      ...optionsFromArgs,
      flights: { ...options?.flights, ...optionsFromArgs.flights },
    }

    super(resolvedOptions)
    const basename = resolvedOptions?.name ?? ''
    this.setBaseName(basename)
  }

  /**
   * update logger's name
   * @param name
   */
  public setName(name: string | null): void {
    const resolvedName: string = [this.basename, name]
      .filter((x): x is string => x != null && x.length > 0)
      .join(' ')
    const self = this as Mutable<this>
    self.name = resolvedName
    this.divisionName = name
  }

  /**
   * update basename of logger
   * @param basename
   */
  public setBaseName(basename: string | null): void {
    this.basename = basename
    this.setName(this.divisionName)
  }

  /**
   * update logger's mode
   * @param mode
   */
  public setMode(mode: 'normal' | 'loose'): void {
    const self = this as Mutable<this>
    self.mode = mode
  }
}
