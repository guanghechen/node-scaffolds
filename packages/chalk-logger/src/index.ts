import type { Mutable } from '@guanghechen/utility-types'
import { partOptionsFromArgs } from './commander'
import type { Level } from './level'
import type { ILoggerOptions } from './logger'
import { Logger } from './logger'

export * from './color'
export * from './commander'
export * from './level'
export * from './logger'

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
    const optionsFromArgs = partOptionsFromArgs(args || [])
    const resolvedOptions = {
      ...options,
      ...optionsFromArgs,
      flags: { ...options?.flags, ...optionsFromArgs.flags },
    }

    super(resolvedOptions)
    const basename = resolvedOptions?.name ?? ''
    this.setBaseName(basename)
  }

  /**
   * update logger's level
   * @param level
   */
  public setLevel(level: Level | null | undefined): void {
    if (level == null) return
    const self = this as Mutable<this>
    self.level = level
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

export default ChalkLogger
