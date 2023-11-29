import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import type { IReporter } from '@guanghechen/reporter.types'
import { SecretMaster } from '../../shared/SecretMaster'
import type { IInputAnswer } from '../../shared/util/input/answer'
import type { IGitCipherSubCommandContext } from './context'
import type { IGitCipherSubCommandOption } from './option'

export interface IGitCipherSubCommandProcessorProps<C extends IGitCipherSubCommandContext> {
  readonly context: C
  /**
   * Reporter to log debug/verbose/info/warn/error messages.
   */
  readonly reporter: IReporter
  /**
   * Ask to input answer.
   */
  inputAnswer: IInputAnswer
}

export interface IGitCipherSubCommandProcessor<
  O extends IGitCipherSubCommandOption,
  C extends IGitCipherSubCommandContext,
> extends ISubCommandProcessor<O> {
  readonly context: C
  readonly secretMaster: SecretMaster
  readonly destroyed: boolean

  /**
   * Destroy the processor.
   */
  destroy(): Promise<void>
}

export abstract class GitCipherSubCommandProcessor<
  O extends IGitCipherSubCommandOption,
  C extends IGitCipherSubCommandContext,
> implements IGitCipherSubCommandProcessor<O, C>
{
  public readonly context: C
  public readonly reporter: IReporter
  public readonly secretMaster: SecretMaster
  private _destroyed: boolean

  constructor(props: IGitCipherSubCommandProcessorProps<C>) {
    const { context, reporter, inputAnswer } = props
    reporter.debug('context:', context)

    this.context = context
    this.reporter = reporter
    this._destroyed = false
    this.secretMaster = new SecretMaster({
      maxRetryTimes: context.maxRetryTimes,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
      reporter,
      showAsterisk: context.showAsterisk,
      inputAnswer,
    })
  }

  public get destroyed(): boolean {
    return this._destroyed
  }

  public abstract process(args: string[], options: O): Promise<void>

  public async destroy(): Promise<void> {
    if (this._destroyed) return

    this._destroyed = true
    this.secretMaster.destroy()
  }
}
