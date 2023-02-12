import type { Mutable } from '@guanghechen/utility-types'
import { writeFileSync } from 'node:fs'
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
    .option('--log-encoding <encoding>', 'Encoding of log file.')
    .option('--log-filepath <filepath>', 'Path which the log file is located.')
    .option('--log-level <level>', 'Log level.')
    .option('--log-name <name>', 'Logger name.')
    .option('--log-mode <normal|loose>', 'Log format mode.')
    .option(
      '--log-flag <[[no-]<date|title|colorful|inline>]>',
      'Enable / disable logger flights.',
      (val: string, acc: string[]) => acc.concat(val),
      [],
    )
}

export function parseOptionsFromCommander(commanderOptions: ICommanderOptions): ILoggerOptions {
  const flags: Partial<Mutable<ILoggerFlags>> = {}
  const options: ILoggerOptions = { flags }

  // Resolve log path
  if (typeof commanderOptions.logFilepath === 'string') {
    const logFilepath = commanderOptions.logFilepath.trim()
    const logEncoding: BufferEncoding =
      (typeof commanderOptions.logEncoding === 'string'
        ? (commanderOptions.logEncoding.trim().toLowerCase() as BufferEncoding)
        : '') || 'utf8'
    options.write = (text: string): void => {
      writeFileSync(logFilepath, text, logEncoding)
    }
  }

  // Resolve log level
  if (typeof commanderOptions.logLevel === 'string') {
    const logLevel = commanderOptions.logLevel.trim().toLowerCase()
    const level = resolveLevel(logLevel)
    if (level != null) options.level = level
  }

  // Resolve log name
  if (typeof commanderOptions.logName === 'string') {
    options.name = commanderOptions.logName.trim()
  }

  // Resolve log mode
  if (typeof commanderOptions.logMode === 'string') {
    const mode = commanderOptions.logMode.trim().toLowerCase()
    if (['normal', 'loose'].includes(mode)) {
      options.mode = mode as 'normal' | 'loose'
    }
  }

  // Resolve log flags
  if (commanderOptions.logFlag) {
    const logFlags: string[] = [commanderOptions.logFlag]
      .flat()
      .filter(Boolean)
      .map(flag => flag.split(/\s*,\s*/g))
      .flat()
      .map(flag => flag.trim().toLowerCase())
      .filter(Boolean)
    for (let flag of logFlags) {
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

export function parseOptionsFromArgs(args: string[]): ILoggerOptions {
  const options: ICommanderOptions = { logFlag: [] }
  const regex = /^--log-([\w]+)(?:=([\s\S]+))?/
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
