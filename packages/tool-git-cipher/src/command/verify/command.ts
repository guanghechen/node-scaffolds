import { Command } from '@guanghechen/helper-commander'
import type { ISubCommand } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../shared/core/constant'
import type { IGitCipherSubCommandProcessor } from '../_base'
import { GitCipherSubCommand } from '../_base'
import { type IGitCipherVerifyContext, createVerifyContextFromOptions } from './context'
import type { IGitCipherVerifyOptions } from './option'
import { resolveSubCommandVerifyOptions } from './option'
import { GitCipherVerify } from './process'

type O = IGitCipherVerifyOptions
type C = IGitCipherVerifyContext

export class GitCipherSubCommandVerify extends GitCipherSubCommand<O, C> implements ISubCommand<O> {
  public override readonly subCommandName: string = 'verify'
  public override readonly aliases: string[] = ['v']

  public override command(processor: IGitCipherSubCommandProcessor<O, C>): Command {
    const { subCommandName, aliases } = this
    const command = new Command()

    command
      .name(subCommandName)
      .aliases(aliases)
      .description('Verify if there are any problems in the crypt repo.')
      .option(
        '--catalog-cache-filepath, --catalogCacheFilepath <catalogCacheFilepath>',
        'The path where catalog cache file located. (relative of workspace)',
      )
      .option('--crypt-commit-id, --cryptCommitId <commitHash>', 'Crypt repo branch or commit id.')
      .option('--plain-commit-id, --plainCommitId <commitHash>', 'Plain repo branch or commit id.')
      .action(async function (args: string[], options: O) {
        await processor.process(args, options)
      })

    return command
  }

  public override async resolve(
    _args: string[],
    options: O,
  ): Promise<IGitCipherSubCommandProcessor<O, C>> {
    const { subCommandName, eventBus, reporter } = this
    const resolvedOptions: O = resolveSubCommandVerifyOptions(COMMAND_NAME, subCommandName, options)
    const context: C = await createVerifyContextFromOptions(resolvedOptions)
    const processor: IGitCipherSubCommandProcessor<O, C> = new GitCipherVerify({
      context,
      eventBus,
      reporter,
    })
    return processor
  }
}
