import type { IEventBus } from '@guanghechen/event-bus'
import { SubCommand } from '@guanghechen/helper-commander'
import type { Command, ISubCommand } from '@guanghechen/helper-commander'
import type { IReporter } from '@guanghechen/reporter.types'
import { ErrorCode, EventTypes } from '../../shared/core/constant'
import { ICustomError } from '../../shared/core/error'
import type { IGitCipherSubCommandContext } from './context'
import type { IGitCipherSubCommandOption } from './option'
import type { IGitCipherSubCommandProcessor } from './process'

export interface IGitCipherSubCommandProps {
  /**
   * Event bus.
   */
  readonly eventBus: IEventBus<EventTypes>
  /**
   * Reporter to log debug/verbose/info/warn/error messages.
   */
  readonly reporter: IReporter
}

export interface IGitCipherSubCommand<
  O extends IGitCipherSubCommandOption,
  C extends IGitCipherSubCommandContext,
> extends ISubCommand<O> {
  resolveProcessor(args: string[], options: O): Promise<IGitCipherSubCommandProcessor<O, C>>
}

export abstract class GitCipherSubCommand<
    O extends IGitCipherSubCommandOption,
    C extends IGitCipherSubCommandContext,
  >
  extends SubCommand<O>
  implements IGitCipherSubCommand<O, C>
{
  public readonly eventBus: IEventBus<EventTypes>
  public readonly reporter: IReporter

  constructor(props: IGitCipherSubCommandProps) {
    super()
    const { eventBus, reporter } = props
    this.eventBus = eventBus
    this.reporter = reporter
  }

  public abstract override command(processor: IGitCipherSubCommandProcessor<O, C>): Command

  public override async process(args: string[], options: O): Promise<void> {
    const processor: IGitCipherSubCommandProcessor<O, C> = await this.resolveProcessor(
      args,
      options,
    )
    const { eventBus, reporter } = this
    try {
      await processor.process(args, options)
    } catch (error: Error | ICustomError | any) {
      const code = error.code || -1
      switch (code) {
        case ErrorCode.BAD_PASSWORD:
        case ErrorCode.ENTERED_PASSWORD_DIFFER:
        case ErrorCode.WRONG_PASSWORD:
          reporter.debug(error)
          reporter.error(error.message ?? error.stack ?? error)
          eventBus.dispatch({ type: EventTypes.EXITING })
          break
        default:
          reporter.error(error)
          eventBus.dispatch({ type: EventTypes.EXITING })
          break
      }
    }
  }

  public abstract override resolveProcessor(
    args: string[],
    options: O,
  ): Promise<IGitCipherSubCommandProcessor<O, C>>
}
