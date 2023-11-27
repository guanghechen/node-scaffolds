import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import type { IReporter } from '@guanghechen/reporter.types'
import type { IToolFileSubCommandContext } from './context'
import type { IToolFileSubCommandOption } from './option'

export interface IToolFileSubCommandProcessorProps<C extends IToolFileSubCommandContext> {
  context: C
  /**
   * Reporter to log debug/verbose/info/warn/error messages.
   */
  readonly reporter: IReporter
}

export interface IToolFileSubCommandProcessor<
  O extends IToolFileSubCommandOption,
  C extends IToolFileSubCommandContext,
> extends ISubCommandProcessor<O> {
  readonly context: C
}

export abstract class ToolFileSubCommandProcessor<
  O extends IToolFileSubCommandOption,
  C extends IToolFileSubCommandContext,
> implements IToolFileSubCommandProcessor<O, C>
{
  public readonly context: C
  public readonly reporter: IReporter

  constructor(props: IToolFileSubCommandProcessorProps<C>) {
    const { context, reporter } = props
    reporter.debug('context:', context)

    this.context = context
    this.reporter = reporter
  }

  public abstract process(args: string[], options: O): Promise<void>
}
