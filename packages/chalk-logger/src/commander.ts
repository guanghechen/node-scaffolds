import type { Mutable } from '@guanghechen/utility-types'
import { resolveLevel } from './level'
import type { ILoggerFlags, ILoggerOptions } from './logger'

/**
 * Commander options
 */
interface ICommanderOptions {
  /**
   * logger level
   */
  logLevel?: string
  /**
   * logger name
   */
  logName?: string
  /**
   * logger mode
   */
  logMode?: string
  /**
   * logger flags
   */
  logFlag?: string[]
  /**
   * filepath of log output
   */
  logFilepath?: string
  /**
   * encoding of log file
   */
  logEncoding?: BufferEncoding
}

interface ICommander {
  option(flags: string, description?: string, defaultValue?: string | boolean): this
  option(flags: string, description: string, regexp: RegExp, defaultValue?: string | boolean): this
  option<T>(
    flags: string,
    description: string,
    fn: (value: string, previous: T) => T,
    defaultValue?: T,
  ): this
}

/**
 * register to commander
 * @param program {commander.Command}
 */
export function registerCommanderOptions(program: ICommander): void {
  program
    .option('--log-level <level>', "specify logger's level.")
    .option('--log-name <name>', "specify logger's name.")
    .option("--log-mode <'normal' | 'loose'>", "specify logger's name.")
    .option(
      '--log-flag <option>',
      "specify logger' option. [[no-]<date|title|colorful|inline>]",
      (val: string, acc: string[]) => acc.concat(val),
      [],
    )
}

export function parseOptionsFromCommander(commanderOptions: ICommanderOptions): ILoggerOptions {
  const flags: Partial<Mutable<ILoggerFlags>> = {}
  const options: ILoggerOptions = { flags }

  // resolve log level
  if (commanderOptions.logLevel != null) {
    const logLevel = commanderOptions.logLevel.toLowerCase()
    const level = resolveLevel(logLevel)
    if (level != null) options.level = level
  }

  // resolve log name
  if (commanderOptions.logName != null) {
    options.name = commanderOptions.logName
  }

  // resolve log mode
  if (commanderOptions.logMode != null) {
    const mode = commanderOptions.logMode.toLowerCase()
    if (['normal', 'loose'].includes(mode)) {
      options.mode = mode as 'normal' | 'loose'
    }
  }

  // resolve log flags
  if (commanderOptions.logFlag != null) {
    for (let flag of commanderOptions.logFlag) {
      let negative = false
      if (/^no-/.test(flag)) {
        negative = true
        flag = flag.slice(3)
      }
      flag = flag.toLowerCase()
      switch (flag) {
        case 'inline':
          flags.inline = !negative
          break
        case 'date':
          flags.date = !negative
          break
        case 'title':
          flags.title = !negative
          break
        case 'colorful':
          flags.colorful = !negative
          break
      }
    }
  }
  return options
}

export function partOptionsFromArgs(args: string[]): ILoggerOptions {
  const options: ICommanderOptions = { logFlag: [] }
  const regex = /^--log-([\w]+)(?:=([-\w]+))?/
  for (let i = 0; i < args.length; ++i) {
    const arg = args[i]
    const match = regex.exec(arg)
    if (match == null) continue
    let [, key, val] = match

    if (val == null) {
      if (i + 1 < args.length) {
        const nextArg = args[i + 1]
        if (/^-/.test(nextArg)) continue
        i += 1
        val = nextArg
      }
    }

    key = key.toLowerCase()
    switch (key) {
      case 'encoding':
        options.logEncoding = val as BufferEncoding
        break
      case 'filepath':
        options.logFilepath = val
        break
      case 'flag':
        options.logFlag!.push(val)
        break
      case 'level':
        options.logLevel = val
        break
      case 'mode':
        options.logMode = val
        break
      case 'name':
        options.logName = val
        break
    }
  }

  return parseOptionsFromCommander(options)
}
