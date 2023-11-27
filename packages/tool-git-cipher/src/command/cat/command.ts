import { Command } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../shared/core/constant'
import type { IGitCipherSubCommand, IGitCipherSubCommandProcessor } from '../_base'
import { GitCipherSubCommand } from '../_base'
import { type IGitCipherCatContext, createCatContextFromOptions } from './context'
import { resolveSubCommandCatOptions } from './option'
import type { IGitCipherCatOptions } from './option'
import { GitCipherCat } from './process'

type O = IGitCipherCatOptions
type C = IGitCipherCatContext

export class GitCipherSubCommandCat
  extends GitCipherSubCommand<O, C>
  implements IGitCipherSubCommand<O, C>
{
  public override readonly subCommandName: string = 'cat'
  public override readonly aliases: string[] = ['c']

  public override command(processor: IGitCipherSubCommandProcessor<O, C>): Command {
    const { subCommandName, aliases } = this
    const command = new Command()

    command
      .name(subCommandName)
      .aliases(aliases)
      .description('Show plain content of a specified crypt file on a branch/commit.')
      .option(
        '--plain-filepath, --plainFilepath <plainFilepath>',
        'The file you want to check the plain content.',
      )
      .action(async function (args: string[], options: O) {
        await processor.process(args, options)
      })
    return command
  }

  public override async resolveProcessor(
    args: string[],
    options: O,
  ): Promise<IGitCipherSubCommandProcessor<O, C>> {
    const { subCommandName, eventBus, reporter, inputAnswer } = this
    const resolvedOptions: O = resolveSubCommandCatOptions(
      COMMAND_NAME,
      subCommandName,
      args,
      options,
      reporter,
    )
    const context: C = await createCatContextFromOptions(resolvedOptions)
    const processor: IGitCipherSubCommandProcessor<O, C> = new GitCipherCat({
      context,
      eventBus,
      reporter,
      inputAnswer,
    })
    return processor
  }
}
