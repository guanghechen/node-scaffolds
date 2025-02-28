import { toCamelCase } from '@guanghechen/std'

export type ICommandOptionValue = void | number | string | boolean | number[] | string[]

export type ICommandOptionArgSize = '?' | '0' | '1'

export interface ICommandOptionDefinition<T extends ICommandOptionValue> {
  readonly name: string
  readonly desc: string
  readonly size: ICommandOptionArgSize
  readonly defaultValue: T
  readonly aliases: IterableIterator<string>
  resolve(current: T | undefined, arg: boolean | string): T | undefined
}

const regexes = {
  optionName: /^[a-zA-Z][a-zA-Z.-_\d]*$/,
}

export abstract class CommandOptionDefinition<T extends ICommandOptionValue>
  implements ICommandOptionDefinition<T>
{
  public readonly name: string
  public readonly desc: string
  public readonly size: ICommandOptionArgSize
  protected readonly _aliases: string[]

  constructor(name: string, desc: string, size: ICommandOptionArgSize) {
    if (!regexes.optionName.test(name)) {
      throw new Error(
        `[CommandOptionDefinition] the option name should be a string matched the regex: ${regexes.optionName.source}, but got: ${name}.`,
      )
    }

    this.name = toCamelCase(name)
    this.desc = desc
    this.size = size
    this._aliases = []
  }

  public get aliases(): IterableIterator<string> {
    return this._aliases.values()
  }

  public alias(alias: string): this {
    if (!regexes.optionName.test(alias)) {
      throw new Error(
        `[CommandOptionDefinition - ${this.name}] alias should be a string matched the regex: ${regexes.optionName.source}, but got: ${alias}.`,
      )
    }

    const normalizedAlias: string = toCamelCase(alias)

    if (normalizedAlias === this.name) {
      throw new Error(
        `[CommandOptionDefinition - ${this.name}] alias should not be the same as option name: ${alias}.`,
      )
    }

    if (this._aliases.includes(normalizedAlias)) {
      throw new Error(`[CommandOptionDefinition - ${this.name}] Duplicate option alias: ${alias}.`)
    }

    this._aliases.push(normalizedAlias)
    return this
  }

  public abstract get defaultValue(): T

  public abstract resolve(current: T | undefined, arg: boolean | string): T | undefined
}

export class BooleanCommandOptionDefinition
  extends CommandOptionDefinition<boolean>
  implements ICommandOptionDefinition<boolean>
{
  protected readonly _defaultValue: boolean

  constructor(name: string, desc: string, defaultValue: boolean) {
    super(name, desc, '0')
    this._defaultValue = defaultValue
  }

  public override get defaultValue(): boolean {
    return this._defaultValue
  }

  public override resolve(
    current: boolean | undefined,
    arg: boolean | string,
  ): boolean | undefined {
    if (typeof arg === 'boolean') return arg
    if (typeof arg === 'string') {
      if (arg.toLowerCase() === 'true') return true
      if (arg.toLowerCase() === 'false') return false
      throw new Error(`Invalid boolean option value, expected 'true' or 'false', but got (${arg}).`)
    }
    return current
  }
}

export class NumberCommandOptionDefinition
  extends CommandOptionDefinition<number>
  implements ICommandOptionDefinition<number>
{
  protected readonly _defaultValue: number

  constructor(name: string, desc: string, defaultValue: number) {
    super(name, desc, '1')
    this._defaultValue = defaultValue
  }

  public override get defaultValue(): number {
    return this._defaultValue
  }

  public override resolve(_current: number | undefined, arg: boolean | string): number | undefined {
    if (typeof arg !== 'string') {
      throw new Error(`Invalid number option value, expected a number, but got (${arg}).`)
    }

    if (arg.trim() === '') {
      throw new Error('Invalid number option value, expected a number, but got an empty string.')
    }

    const value: number = Number(arg)
    return value
  }
}

export class StringCommandOptionDefinition
  extends CommandOptionDefinition<string>
  implements ICommandOptionDefinition<string>
{
  protected readonly _defaultValue: string

  constructor(name: string, desc: string, defaultValue: string) {
    super(name, desc, '1')
    this._defaultValue = defaultValue
  }

  public override get defaultValue(): string {
    return this._defaultValue
  }

  public override resolve(_current: string | undefined, arg: boolean | string): string | undefined {
    if (typeof arg !== 'string') {
      throw new Error(`Invalid string option value, expected a string, but got (${arg}).`)
    }

    if (arg.trim() === '') {
      throw new Error('Invalid string option value, expected a non-empty string.')
    }
    return arg
  }
}
export class NumberListCommandOptionDefinition
  extends CommandOptionDefinition<number[]>
  implements ICommandOptionDefinition<number[]>
{
  public readonly _defaultValue: number[]

  constructor(name: string, desc: string, defaultValue: number[] = []) {
    super(name, desc, '1')
    this._defaultValue = defaultValue
  }

  public override get defaultValue(): number[] {
    return this._defaultValue.slice()
  }

  public override resolve(
    current: number[] | undefined,
    arg: boolean | string,
  ): number[] | undefined {
    if (typeof arg !== 'string') {
      throw new Error(`Invalid number list option value, expected a string, but got (${arg}).`)
    }

    if (arg.trim() === '') {
      throw new Error('Invalid number list option value, expected a non-empty string.')
    }

    const value: number = Number(arg)
    if (isNaN(value)) {
      throw new Error(`Invalid number list option value, expected a number, but got (${arg}).`)
    }

    return current ? [...current, value] : [value]
  }
}

export class StringListCommandOptionDefinition
  extends CommandOptionDefinition<string[]>
  implements ICommandOptionDefinition<string[]>
{
  public readonly _defaultValue: string[]

  constructor(name: string, desc: string, defaultValue: string[] = []) {
    super(name, desc, '1')
    this._defaultValue = defaultValue
  }

  public override get defaultValue(): string[] {
    return this._defaultValue.slice()
  }

  public override resolve(
    current: string[] | undefined,
    arg: boolean | string,
  ): string[] | undefined {
    if (typeof arg !== 'string') {
      throw new Error(`Invalid string list option value, expected a string, but got (${arg}).`)
    }

    if (arg.trim() === '') {
      throw new Error('Invalid string list option value, expected a non-empty string.')
    }
    return current ? [...current, arg.trim()] : [arg.trim()]
  }
}
