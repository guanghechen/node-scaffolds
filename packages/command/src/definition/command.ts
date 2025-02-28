import { toCamelCase } from '@guanghechen/std'
import {
  BooleanCommandOptionDefinition,
  type ICommandOptionDefinition,
  type ICommandOptionValue,
} from './option'

export type ICommandArgumentSize = '*' | '+' | '?' | '1'

export interface ICommandArgumentDefinition {
  readonly name: string
  readonly size: ICommandArgumentSize
}

export interface ICommandDefinition {
  readonly name: string
  readonly desc: string
  readonly aliases: IterableIterator<string>
  readonly args: IterableIterator<ICommandArgumentDefinition>
  readonly options: IterableIterator<ICommandOptionDefinition<ICommandOptionValue>>
  hasAlias(alias: string): boolean
  getOption(name: string): ICommandOptionDefinition<ICommandOptionValue> | undefined
}

const regexes = {
  commandName: /^[a-zA-Z][a-zA-Z.-_\d]*$/,
  argumentName: /^[a-zA-Z][a-zA-Z.-_\d]*$/,
}

export class CommandDefinition implements ICommandDefinition {
  public readonly name: string
  public readonly desc: string
  protected readonly _aliases: string[]
  protected readonly _args: ICommandArgumentDefinition[]
  protected readonly _options: Array<ICommandOptionDefinition<ICommandOptionValue>>
  protected readonly _optionMap: Map<string, ICommandOptionDefinition<ICommandOptionValue>>

  constructor(name: string, desc: string) {
    if (!regexes.commandName.test(name)) {
      throw new Error(
        `[CommandDefinition] the command name should be a string matched the regex: ${regexes.commandName.source}, but got: ${name}.`,
      )
    }

    this.name = toCamelCase(name)
    this.desc = desc
    this._aliases = []
    this._args = []
    this._options = [
      new BooleanCommandOptionDefinition('help', 'Show help information.', false).alias('h'),
    ]
    this._optionMap = new Map<string, ICommandOptionDefinition<ICommandOptionValue>>()
  }

  public get aliases(): IterableIterator<string> {
    return this._aliases.values()
  }

  public get args(): IterableIterator<ICommandArgumentDefinition> {
    return this._args.values()
  }

  public get options(): IterableIterator<ICommandOptionDefinition<ICommandOptionValue>> {
    return this._options.values()
  }

  public hasAlias(alias: string): boolean {
    return this._aliases.includes(alias)
  }

  public getOption(name: string): ICommandOptionDefinition<ICommandOptionValue> | undefined {
    return this._optionMap.get(name)
  }

  public alias(alias: string): this {
    if (!regexes.commandName.test(alias)) {
      throw new Error(
        `[CommandDefinition - ${this.name}] alias should be a string matched the regex: ${regexes.commandName.source}, but got: ${alias}.`,
      )
    }

    const normalizedAlias: string = toCamelCase(alias)

    if (normalizedAlias === this.name) {
      throw new Error(
        `[CommandDefinition - ${this.name}] alias should not be the same as command name: ${alias}.`,
      )
    }

    if (this._aliases.includes(normalizedAlias)) {
      throw new Error(`[CommandDefinition - ${this.name}] Duplicate alias: ${alias}.`)
    }

    this._aliases.push(normalizedAlias)
    return this
  }

  public arg(name: string, size: ICommandArgumentSize): this {
    if (!regexes.argumentName.test(name)) {
      throw new Error(
        `[CommandDefinition - ${this.name}] argument name should be a string matched the regex: ${regexes.argumentName.source}, but got: ${name}.`,
      )
    }

    if (this._args.find(a => a.name === name)) {
      throw new Error(`[CommandDefinition - ${this.name}] Duplicate argument name: ${name}.`)
    }

    const definition: ICommandArgumentDefinition = { name, size }
    this._args.push(definition)
    return this
  }

  public option(option: ICommandOptionDefinition<ICommandOptionValue>): this {
    const optionMap: Map<string, ICommandOptionDefinition<ICommandOptionValue>> = this._optionMap
    if (optionMap.has(option.name)) {
      throw new Error(`[CommandDefinition - ${this.name}] Duplicate option name: ${option.name}.`)
    }

    for (const alias of option.aliases) {
      if (optionMap.has(alias)) {
        throw new Error(`[CommandDefinition - ${this.name}] Duplicate option alias: ${alias}.`)
      }
    }

    optionMap.set(option.name, option)
    for (const alias of option.aliases) optionMap.set(alias, option)
    this._options.push(option)
    return this
  }
}
