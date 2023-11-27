import type { IEventBus } from '@guanghechen/event-bus'
import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import type { IReporter } from '@guanghechen/reporter.types'
import type { EventTypes } from '../../shared/core/constant'
import { SecretMaster } from '../../shared/SecretMaster'
import type { IGitCipherSubCommandContext } from './context'
import type { IGitCipherSubCommandOption } from './option'

export interface IGitCipherSubCommandProcessorProps<C extends IGitCipherSubCommandContext> {
  context: C
  /**
   * Event bus.
   */
  readonly eventBus: IEventBus<EventTypes>
  /**
   * Reporter to log debug/verbose/info/warn/error messages.
   */
  readonly reporter: IReporter
}

export interface IGitCipherSubCommandProcessor<
  O extends IGitCipherSubCommandOption,
  C extends IGitCipherSubCommandContext,
> extends ISubCommandProcessor<O> {
  readonly context: C
  readonly secretMaster: SecretMaster
}

export abstract class GitCipherSubCommandProcessor<
  O extends IGitCipherSubCommandOption,
  C extends IGitCipherSubCommandContext,
> implements IGitCipherSubCommandProcessor<O, C>
{
  public readonly context: C
  public readonly eventBus: IEventBus<EventTypes>
  public readonly reporter: IReporter
  public readonly secretMaster: SecretMaster

  constructor(props: IGitCipherSubCommandProcessorProps<C>) {
    const { context, eventBus, reporter } = props
    reporter.debug('context:', context)

    this.context = context
    this.eventBus = eventBus
    this.reporter = reporter
    this.secretMaster = new SecretMaster({
      eventBus,
      maxRetryTimes: context.maxRetryTimes,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
      reporter,
      showAsterisk: context.showAsterisk,
    })
  }

  public abstract process(args: string[], options: O): Promise<void>
}
