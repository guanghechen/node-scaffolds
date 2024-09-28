import { SubCommand } from '@guanghechen/commander'
import type { Command, ISubCommand } from '@guanghechen/commander'
import type { IReporter } from '@guanghechen/reporter'
import type { IToolFileSubCommandContext } from './context'
import type { IToolFileSubCommandOption } from './option'
import type { IToolFileSubCommandProcessor } from './process'

export interface IToolFileSubCommandProps {
  /**
   * Reporter to log debug/verbose/info/warn/error messages.
   */
  readonly reporter: IReporter
}

export interface IToolFileSubCommand<
  O extends IToolFileSubCommandOption,
  C extends IToolFileSubCommandContext,
> extends ISubCommand<O> {
  resolveProcessor(args: string[], options: O): Promise<IToolFileSubCommandProcessor<O, C>>
}

export abstract class ToolFileSubCommand<
    O extends IToolFileSubCommandOption,
    C extends IToolFileSubCommandContext,
  >
  extends SubCommand<O>
  implements IToolFileSubCommand<O, C>
{
  public readonly reporter: IReporter

  constructor(props: IToolFileSubCommandProps) {
    super()
    const { reporter } = props
    this.reporter = reporter
  }

  public abstract override command(processor: IToolFileSubCommandProcessor<O, C>): Command

  public override async process(args: string[], options: O): Promise<void> {
    const processor: IToolFileSubCommandProcessor<O, C> = await this.resolveProcessor(args, options)
    await processor.process(args, options)
  }

  public abstract override resolveProcessor(
    args: string[],
    options: O,
  ): Promise<IToolFileSubCommandProcessor<O, C>>
}
