import { isString } from '@guanghechen/helper-is'
import type { ILogger, Mutable } from '@guanghechen/utility-types'
import dayjs from 'dayjs'
import { normalizeString } from './format'
import type { ILevelStyleMap } from './level'
import { Level, defaultLevelStyleMap, levelOrdinalMap } from './level'

export interface ILoggerFlights {
  readonly date: boolean
  readonly title: boolean
  readonly inline: boolean
  readonly colorful: boolean
}

export interface ILoggerOptions {
  name?: string
  mode?: 'normal' | 'loose'
  level?: Level | null
  levelStyleMap?: ILevelStyleMap
  flights?: Partial<ILoggerFlights>
  placeholderRegex?: RegExp
  write?(text: string): void
}

export class Logger implements ILogger {
  public readonly name: string
  public readonly mode: 'normal' | 'loose' = 'normal'
  public readonly level: Level
  public readonly levelStyleMap: ILevelStyleMap
  public readonly flights: ILoggerFlights
  public readonly placeholderRegex: RegExp = /(?<!\\)\{\}/g
  public readonly write: (text: string) => void

  constructor(options?: ILoggerOptions) {
    this.name = ''
    this.level = options?.level ?? Level.INFO
    this.levelStyleMap = options?.levelStyleMap ?? defaultLevelStyleMap
    this.write = text => {
      process.stdout.write(text)
    }
    this.flights = {
      date: false,
      title: true,
      inline: false,
      colorful: true,
    }
    this.init(options)
  }

  public init(options?: ILoggerOptions): void {
    if (!options) return

    const self = this as Mutable<this>

    // Set logger name.
    self.name = options.name ?? self.name

    // Set logger mode.
    self.mode = options.mode ?? self.mode

    // Set logger level.
    self.level = options.level ?? self.level
    self.levelStyleMap = options.levelStyleMap ?? self.levelStyleMap

    // Set logger flights.
    if (options.flights) {
      const selfFlights = self.flights as Mutable<ILoggerFlights>
      selfFlights.date = options.flights.date ?? selfFlights.date
      selfFlights.title = options.flights.title ?? selfFlights.title
      selfFlights.inline = options.flights.inline ?? selfFlights.inline
      selfFlights.colorful = options.flights.colorful ?? selfFlights.colorful
    }

    // set placeholderRegex
    if (options.placeholderRegex != null) {
      let flags: string = this.placeholderRegex.flags
      if (!flags.includes('g')) flags += 'g'
      self.placeholderRegex = new RegExp(options.placeholderRegex.source, `${flags}`)
    }

    // Set logger writer.
    self.write = options.write ?? self.write
  }

  // format a log record.
  public format(level: Level, header: string, message: string): string {
    const content: string = this.formatContent(level, message)
    return header.length > 0 ? header + ' ' + content : content
  }

  // format a log record's header.
  public formatHeader(level: Level, date: Date): string {
    const dateText: string = this.flights.date
      ? this.formatContent(level, dayjs(date).format('YYYY-MM-DD HH:mm:ss'))
      : ''

    const levelStyle = this.levelStyleMap[level]
    let levelText = levelStyle.title
    if (this.flights.colorful) {
      levelText = levelStyle.labelChalk.fg(levelText)
      if (levelStyle.labelChalk.bg != null) levelText = levelStyle.labelChalk.bg(levelText)
    }

    const titleText: string = this.flights.title
      ? this.formatContent(level, '[' + this.name + ']')
      : ''

    let result = ''
    if (dateText) result += dateText + ' '
    result += levelText
    if (titleText) result += ' ' + titleText
    return result
  }

  public formatContent(level: Level, message: string): string {
    let text: string = message
    if (this.flights.colorful) {
      const levelStyle = this.levelStyleMap[level]
      text = levelStyle.contentChalk.fg(text)
      if (levelStyle.contentChalk.bg != null) {
        text = levelStyle.contentChalk.bg(text)
      }
    }
    return text
  }

  // format a log record part message according its type.
  public formatSingleMessage(message: unknown): string {
    return normalizeString(message ? message : String(message), this.flights.inline)
  }

  public debug(messageFormat: string | unknown, ...messages: unknown[]): void {
    this.log(Level.DEBUG, messageFormat, ...messages)
  }

  public verbose(messageFormat: string | unknown, ...messages: unknown[]): void {
    this.log(Level.VERBOSE, messageFormat, ...messages)
  }

  public info(messageFormat: string | unknown, ...messages: unknown[]): void {
    this.log(Level.INFO, messageFormat, ...messages)
  }

  public warn(messageFormat: string | unknown, ...messages: unknown[]): void {
    this.log(Level.WARN, messageFormat, ...messages)
  }

  public error(messageFormat: string | unknown, ...messages: unknown[]): void {
    this.log(Level.ERROR, messageFormat, ...messages)
  }

  public fatal(messageFormat: string | unknown, ...messages: unknown[]): void {
    this.log(Level.FATAL, messageFormat, ...messages)
  }

  // write a log record.
  public log(level: Level, messageFormat: string | unknown, ...messages: unknown[]): void {
    if (!level || levelOrdinalMap[level] < levelOrdinalMap[this.level]) return
    const header = this.formatHeader(level, new Date())

    let newline = false
    const formatPattern: string = isString(messageFormat) ? messageFormat : ''
    const items: string[] = (isString(messageFormat) ? messages : [messageFormat, ...messages]).map(
      msg => {
        const text = this.formatSingleMessage(msg)
        if (text.endsWith('\n')) {
          newline = true
          return '\n' + text
        }
        return text
      },
    )

    let unpairedIdx = 0
    let message =
      items.length > 0
        ? formatPattern.replace(this.placeholderRegex, m => {
            const value = items[unpairedIdx]
            unpairedIdx += 1
            return value === undefined ? m : value
          })
        : formatPattern
    if (unpairedIdx < items.length) message += ' ' + items.slice(unpairedIdx).join(' ')
    if (!newline && !message.endsWith('\n')) message += '\n'

    switch (this.mode) {
      case 'loose':
        this.write('\n' + this.format(level, header, message) + '\n')
        break
      case 'normal':
      default:
        this.write(this.format(level, header, message))
        break
    }
  }
}
