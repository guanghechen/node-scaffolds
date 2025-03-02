import type {
  ICommand,
  ICommandArguments,
  ICommandContext,
  ICommandEnv,
  ICommandOptions,
  ICommandState,
} from './command'
import { Command } from './command'
import type { ICommandDefinition } from './definition/command'

export interface ICommandItem<C extends ICommandContext> {
  readonly subcommand: string | undefined
  readonly state: ICommandState<C>
}

export interface ITopCommand<C extends ICommandContext> extends ICommand<C> {
  readonly version: string
  readonly parent: null
  readonly initialContext: C
}

export interface ITopCommandProps {
  readonly name: string
  readonly desc: string
  readonly version: string
  readonly aliases?: string[]
}

export abstract class TopCommand<C extends ICommandContext>
  extends Command<C>
  implements ITopCommand<C>
{
  public readonly version: string

  constructor(definition: ICommandDefinition, version: string) {
    super(definition)
    this.version = version
  }

  public override get parent(): null {
    return null
  }

  public override setParent(_parent: ICommand<C>): void {
    throw new Error(`[${this.name}] top command cannot have a parent command.`)
  }

  public abstract get initialContext(): C

  public parse(argv: string[]): Array<ICommandItem<C>> {
    let context: C = this.initialContext
    const items: Array<ICommandItem<C>> = []
    parse(this, 0)
    return items

    function parse(command: ICommand<C>, argIndex: number): void {
      const args: ICommandArguments = {}
      const options: ICommandOptions = {}
      for (let i = argIndex; i < argv.length; i++) {
        const arg: string = argv[i].trim()
        const subcommand = command.getSubcommand(arg)
        if (subcommand) {
          context = subcommand.sharpContext({ context, args, options })
          const state: ICommandState<C> = { context, args, options }
          const item: ICommandItem<C> = { subcommand: arg, state }
          items.push(item)
          parse(subcommand, i + 1)
          break
        }
        // return void parse(subcommand, argIndex + 1)
      }
    }
  }

  public async run(state: ICommandState<C>): Promise<void> {
    if (state.options.version) {
      console.log(this.version)
      return
    }
  }
}
