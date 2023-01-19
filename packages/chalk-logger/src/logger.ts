import { isFunction } from '@guanghechen/helper-is'
import type { ILogger, Mutable } from '@guanghechen/utility-types'
import type { ChalkInstance } from 'chalk'
import chalk from 'chalk'
import dayjs from 'dayjs'
import type { IColor } from './color'
import { color2chalk } from './color'
import { normalizeString } from './format'
import type { ILevelStyleMap } from './level'
import { Level, defaultLevelStyleMap, levelOrdinalMap } from './level'

export interface ILoggerFlags {
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
  flags?: Partial<ILoggerFlags>
  dateChalk?: ChalkInstance | IColor
  nameChalk?: ChalkInstance | IColor
  placeholderRegex?: RegExp
  write?(text: string): void
}

export class Logger implements ILogger {
  public readonly name: string
  public readonly mode: 'normal' | 'loose' = 'normal'
  public readonly level: Level
  public readonly levelStyleMap: ILevelStyleMap
  public readonly flags: ILoggerFlags
  public readonly dateChalk = chalk.grey
  public readonly nameChalk = chalk.grey
  public readonly placeholderRegex: RegExp = /(?<!\\)\{\}/g
  public readonly write: (text: string) => void

  constructor(options?: ILoggerOptions) {
    this.name = ''
    this.level = options?.level ?? Level.INFO
    this.levelStyleMap = options?.levelStyleMap ?? defaultLevelStyleMap
    this.write = text => {
      process.stdout.write(text)
    }
    this.flags = {
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

    // Set logger flags.
    if (options.flags) {
      const selfFlags = self.flags as Mutable<ILoggerFlags>
      selfFlags.date = options.flags.date ?? selfFlags.date
      selfFlags.title = options.flags.title ?? selfFlags.title
      selfFlags.inline = options.flags.inline ?? selfFlags.inline
      selfFlags.colorful = options.flags.colorful ?? selfFlags.colorful
    }

    // set placeholderRegex
    if (options.placeholderRegex != null) {
      let flags: string = this.placeholderRegex.flags
      if (!flags.includes('g')) flags += 'g'
      self.placeholderRegex = new RegExp(options.placeholderRegex.source, `${flags}`)
    }

    // Set logger writer.
    self.write = options.write ?? self.write

    // Set dateChalk.
    if (options.dateChalk != null) {
      self.dateChalk = isFunction(options.dateChalk)
        ? options.dateChalk
        : color2chalk(options.dateChalk, true)
    }

    // Set nameChalk.
    if (options.nameChalk != null) {
      self.nameChalk = isFunction(options.nameChalk)
        ? options.nameChalk
        : color2chalk(options.nameChalk, true)
    }
  }

  // format a log record.
  public format(level: Level, header: string, message: string): string {
    if (this.flags.colorful) {
      const levelStyle = this.levelStyleMap[level]
      // eslint-disable-next-line no-param-reassign
      message = levelStyle.content.fg(message)
      if (levelStyle.content.bg != null) {
        // eslint-disable-next-line no-param-reassign
        message = levelStyle.content.bg(message)
      }
    }
    return header.length > 0 ? header + ' ' + message : message
  }

  // format a log record's header.
  public formatHeader(level: Level, date: Date): string {
    const levelStyle = this.levelStyleMap[level]
    let dateInfo = ''
    if (this.flags.date) {
      const { dateChalk } = this
      dateInfo = dayjs(date).format('YYYY-MM-DD HH:mm:ss')
      if (this.flags.colorful) dateInfo = dateChalk(dateInfo)
    }

    let title = ''
    if (this.flags.title) {
      let desc = levelStyle.title
      const { name, nameChalk } = this
      let chalkedName = name
      if (this.flags.colorful) {
        desc = levelStyle.header.fg(desc)
        if (levelStyle.header.bg != null) desc = levelStyle.header.bg(desc)
        chalkedName = nameChalk(name as any)
      }
      title = name.length > 0 ? `${desc} ${chalkedName}` : desc
      title = `[${title}]`
    }

    if (dateInfo.length > 0) {
      if (title.length > 0) return dateInfo + ' ' + title
      return dateInfo
    }

    return title
  }

  // format a log record part message according its type.
  public formatSingleMessage(message: unknown): string {
    return normalizeString(message, this.flags.inline)
  }

  public debug(messageFormat: string, ...messages: any[]): void {
    this.log(Level.DEBUG, messageFormat, ...messages)
  }

  public verbose(messageFormat: string, ...messages: any[]): void {
    this.log(Level.VERBOSE, messageFormat, ...messages)
  }

  public info(messageFormat: string, ...messages: any[]): void {
    this.log(Level.INFO, messageFormat, ...messages)
  }

  public warn(messageFormat: string, ...messages: any[]): void {
    this.log(Level.WARN, messageFormat, ...messages)
  }

  public error(messageFormat: string, ...messages: any[]): void {
    this.log(Level.ERROR, messageFormat, ...messages)
  }

  public fatal(messageFormat: string, ...messages: any[]): void {
    this.log(Level.FATAL, messageFormat, ...messages)
  }

  // write a log record.
  public log(level: Level, messageFormat: string, ...messages: any[]): void {
    if (!level || levelOrdinalMap[level] < levelOrdinalMap[this.level]) return
    const header = this.formatHeader(level, new Date())
    let newline = false
    const items: string[] = messages.map(msg => {
      if (msg == null) {
        // eslint-disable-next-line no-param-reassign
        msg = '' + msg
      }
      let text = this.formatSingleMessage(msg)
      if (text.endsWith('\n')) {
        text = '\n' + text
        newline = true
      }
      return text
    })

    let idx = 0
    let message: string = messageFormat.replace(this.placeholderRegex, m => {
      // eslint-disable-next-line no-plusplus
      const value = items[idx++]
      return value === undefined ? m : value
    })
    if (idx < items.length) message += ' ' + items.slice(idx).join(' ')
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
