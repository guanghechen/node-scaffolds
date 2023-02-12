import type { Mutable } from '@guanghechen/utility-types'
import { writeFileSync } from 'node:fs'
import { resolveLevel } from './level'
import type { ILoggerFlights, ILoggerOptions } from './logger'

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
   * logger flights
   */
  logFlight?: string[]
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
  option(option: string, description?: string, defaultValue?: string | boolean): this
  option<T>(
    option: string,
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
      '--log-flight <[[no-]<date|title|colorful|inline>]>',
      'Enable / disable logger flights.',
      (val: string, acc: string[]) => acc.concat(val),
      [],
    )
}

export function parseOptionsFromCommander(commanderOptions: ICommanderOptions): ILoggerOptions {
  const flights: Partial<Mutable<ILoggerFlights>> = {}
  const options: ILoggerOptions = { flights }

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

  // Resolve log flights
  if (commanderOptions.logFlight) {
    const logFlights: string[] = [commanderOptions.logFlight]
      .flat()
      .filter(Boolean)
      .map(flight => flight.split(/\s*,\s*/g))
      .flat()
      .map(flight => flight.trim().toLowerCase())
      .filter(Boolean)
    for (let flight of logFlights) {
      let negative = false
      if (/^no-/.test(flight)) {
        negative = true
        flight = flight.slice(3)
      }
      flight = flight.toLowerCase()
      switch (flight) {
        case 'inline':
          flights.inline = !negative
          break
        case 'date':
          flights.date = !negative
          break
        case 'title':
          flights.title = !negative
          break
        case 'colorful':
          flights.colorful = !negative
          break
      }
    }
  }
  return options
}

export function parseOptionsFromArgs(args: string[]): ILoggerOptions {
  const options: ICommanderOptions = { logFlight: [] }
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
      case 'flight':
        options.logFlight!.push(val)
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
