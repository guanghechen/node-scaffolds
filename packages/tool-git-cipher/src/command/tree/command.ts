import type { ISubCommand } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../shared/core/constant'
import type { IGitCipherSubCommandProcessor } from '../_base'
import { GitCipherSubCommand } from '../_base'
import { type IGitCipherTreeContext, createTreeContextFromOptions } from './context'
import type { IGitCipherTreeOptions } from './option'
import { resolveSubCommandTreeOptions } from './option'
import { GitCipherTree } from './process'

type O = IGitCipherTreeOptions
type C = IGitCipherTreeContext

export class GitCipherSubCommandTree extends GitCipherSubCommand<O, C> implements ISubCommand<O> {
  public override readonly subCommandName: string = 'tree'
  public override readonly aliases: string[] = ['t']

  public override command(processor: IGitCipherSubCommandProcessor<O, C>): Command {
    const { subCommandName, aliases } = this
    const command = new Command()

    command
      .name(subCommandName)
      .aliases(aliases)
      .description('Preview staged files in plainRootDir with tree style')
      .option('--files-at, --filesAt <commitHash>', 'Crypt repo branch or commit id.')
      .action(async function (args: string[], options: IGitCipherTreeOptions) {
        await processor.process(args, options)
      })

    return command
  }

  public override async resolveProcessor(
    args: string[],
    options: O,
  ): Promise<IGitCipherSubCommandProcessor<O, C>> {
    const { subCommandName, eventBus, reporter, inputAnswer } = this
    const resolvedOptions: O = resolveSubCommandTreeOptions(
      COMMAND_NAME,
      subCommandName,
      args,
      options,
      reporter,
    )
    const context: C = await createTreeContextFromOptions(resolvedOptions)
    const processor: IGitCipherSubCommandProcessor<O, C> = new GitCipherTree({
      context,
      eventBus,
      reporter,
      inputAnswer,
    })
    return processor
  }
}
