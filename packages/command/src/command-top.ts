import type { ICommand } from './command'
import { Command } from './command'
import type { ICommandDefinition } from './definition/command'

export interface ITopCommand extends ICommand {
  readonly version: string
  readonly parent: null
}

export interface ITopCommandProps {
  readonly name: string
  readonly desc: string
  readonly version: string
  readonly aliases?: string[]
}

export class TopCommand extends Command implements ITopCommand {
  public readonly version: string

  constructor(definition: ICommandDefinition, version: string) {
    super(definition)
    this.version = version
  }

  public override get parent(): null {
    return null
  }

  public override setParent(_parent: ICommand): void {
    throw new Error(`[${this.name}] top command cannot have a parent command.`)
  }
}
