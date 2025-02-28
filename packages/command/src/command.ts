import { toKebabCase } from '@guanghechen/std'
import type { ICommandDefinition } from './definition/command'
import type { ICommandOptionDefinition, ICommandOptionValue } from './definition/option'

export type ICommandEnv = Record<string, string>
export type ICommandArguments = Record<string, string>
export type ICommandOptions = Record<string, ICommandOptionValue>

export interface ICommandContext {
  readonly subcommand: string | undefined
  readonly env: ICommandEnv
  readonly args: ICommandArguments
  readonly options: ICommandOptions
}

export interface ICommand {
  readonly name: string
  readonly desc: string
  readonly path: string[]
  readonly definition: ICommandDefinition
  readonly subcommands: IterableIterator<ICommand>
  readonly parent: ICommand | null
  readonly usage: string
  getSubcommand(name: string): ICommand | undefined
  setParent(parent: ICommand): void
  run(ctx: ICommandContext): Promise<void>
}

export abstract class Command implements ICommand {
  public readonly definition: ICommandDefinition
  protected readonly _subcommands: ICommand[]
  protected readonly _subcommandMap: Map<string, ICommand>
  protected _parent: ICommand | null

  constructor(definition: ICommandDefinition) {
    this.definition = definition
    this._parent = null
    this._subcommands = []
    this._subcommandMap = new Map<string, ICommand>()
  }

  public get name(): string {
    return this.definition.name
  }

  public get desc(): string {
    return this.definition.desc
  }

  public get path(): string[] {
    const names: string[] = [this.name]
    for (let cmd: ICommand | null = this._parent; cmd; cmd = cmd.parent) names.push(cmd.name)
    return names.reverse()
  }

  public get subcommands(): IterableIterator<ICommand> {
    return this._subcommands.values()
  }

  public get parent(): ICommand | null {
    return this._parent
  }

  public get usage(): string {
    const definition: ICommandDefinition = this.definition
    const path: string = this.path.join(' ')
    const name: string = [definition.name, ...definition.aliases].join('|')

    let leftWidth: number = 0

    const options: Array<[string, string]> = Array.from(definition.options).map(option => {
      const optNames: string[] = [option.name, ...option.aliases].sort()
      const optName: string = optNames
        .map(x => (x.length === 1 ? `-${x}` : `--${toKebabCase(x)}`))
        .join(', ')

      const arg: string =
        option.size === '?' ? `[${option.name}]` : option.size === '0' ? '' : `[${option.name}]`
      const left: string = optName + ' ' + arg
      leftWidth = Math.max(leftWidth, left.length)
      return [left, option.desc]
    })

    const subcommands: Array<[string, string]> = this._subcommands.map(subcommand => {
      const cmdNames: string[] = [
        subcommand.name,
        ...Array.from(subcommand.definition.aliases).sort(),
      ]
      const left: string = cmdNames.join('|')
      leftWidth = Math.max(leftWidth, left.length)
      return [left, subcommand.desc]
    })

    let content: string = `Usage: ${path} ${name} [options] [args]\n`
    if (options.length > 0) {
      content += '\nOptions:\n'
      for (const [left, right] of options) content += `  ${left.padEnd(leftWidth)}  ${right}\n`
    }
    if (subcommands.length > 0) {
      content += '\nCommands:\n'
      for (const [left, right] of subcommands) content += `  ${left.padEnd(leftWidth)}  ${right}\n`
    }
    content += '\n'
    return content
  }

  public hasAlias(alias: string): boolean {
    return this.definition.hasAlias(alias)
  }

  public getOption(name: string): ICommandOptionDefinition<ICommandOptionValue> | undefined {
    return this.definition.getOption(name)
  }

  public getSubcommand(name: string): ICommand | undefined {
    return this._subcommandMap.get(name)
  }

  public setParent(parent: ICommand): void {
    this._parent = parent
  }

  public subcommand(subcommand: ICommand): this {
    if (!subcommand.name || typeof subcommand.name !== 'string') {
      const path: string = this.path.join('/')
      throw new Error(`[${path}] Bad subcommand name: ${subcommand.name}`)
    }

    if (this._subcommands.find(s => s.name === subcommand.name)) {
      const path: string = this.path.join('/')
      throw new Error(`Duplicate subcommand: ${subcommand.name} of command ${path}`)
    }

    subcommand.setParent(this)
    this._subcommands.push(subcommand)
    return this
  }

  public abstract run(ctx: ICommandContext): Promise<void>
}
