import { SubCommand } from '@guanghechen/helper-commander'
import type { Command, ISubCommand } from '@guanghechen/helper-commander'
import type { IReporter } from '@guanghechen/reporter.types'
import { CustomErrorCode } from '../../shared/core/constant'
import { CustomError, isCustomError } from '../../shared/core/error'
import type { IInputAnswer } from '../../shared/util/input/answer'
import type { IGitCipherSubCommandContext } from './context'
import type { IGitCipherSubCommandOption } from './option'
import type { IGitCipherSubCommandProcessor } from './process'

export interface IGitCipherSubCommandProps {
  /**
   * Reporter to log debug/verbose/info/warn/error messages.
   */
  readonly reporter: IReporter
  /**
   * Ask to input answer.
   */
  inputAnswer: IInputAnswer
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
  public readonly reporter: IReporter
  public readonly inputAnswer: IInputAnswer

  constructor(props: IGitCipherSubCommandProps) {
    super()
    const { reporter, inputAnswer } = props
    this.reporter = reporter
    this.inputAnswer = inputAnswer
  }

  public abstract override command(processor: IGitCipherSubCommandProcessor<O, C>): Command

  public override async process(args: string[], options: O): Promise<void> {
    const { reporter } = this
    const title: string = this.constructor.name
    const processor: IGitCipherSubCommandProcessor<O, C> = await this.resolveProcessor(
      args,
      options,
    )
    if (processor.destroyed) {
      throw new Error(`[${title}] something is wrong, the processor has been destroyed.`)
    }

    try {
      await processor.process(args, options)
    } catch (error: Error | any) {
      if (isCustomError(error)) {
        switch (error.code) {
          case CustomErrorCode.BAD_PASSWORD:
          case CustomErrorCode.ENTERED_PASSWORD_DIFFER:
          case CustomErrorCode.WRONG_PASSWORD:
            reporter.debug('[{}] {}', title, error.code, error)
            reporter.error(error.message)
            throw new CustomError(CustomErrorCode.SOFT_EXITING, 'exiting')
          default:
            reporter.error('[{}] {}', title, error.code, error)
            throw new CustomError(CustomErrorCode.SOFT_EXITING, 'exiting')
        }
      }
    } finally {
      await processor.destroy()
    }
  }

  public abstract override resolveProcessor(
    args: string[],
    options: O,
  ): Promise<IGitCipherSubCommandProcessor<O, C>>
}
