import { Command } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../shared/core/constant'
import type { IGitCipherSubCommand, IGitCipherSubCommandProcessor } from '../_base'
import { GitCipherSubCommand } from '../_base'
import { type IGitCipherEncryptContext, createEncryptContextFromOptions } from './context'
import { resolveSubCommandEncryptOptions } from './option'
import type { IGitCipherEncryptOptions } from './option'
import { GitCipherEncrypt } from './process'

type O = IGitCipherEncryptOptions
type C = IGitCipherEncryptContext

export class GitCipherSubCommandEncrypt
  extends GitCipherSubCommand<O, C>
  implements IGitCipherSubCommand<O, C>
{
  public override readonly subCommandName: string = 'encrypt'
  public override readonly aliases: string[] = ['e']

  public override command(processor: IGitCipherSubCommandProcessor<O, C>): Command {
    const { subCommandName, aliases } = this
    const command = new Command()

    command
      .name(subCommandName)
      .aliases(aliases)
      .description('Encrypt git repo.')
      .option(
        '--catalog-cache-filepath, --catalogCacheFilepath <catalogCacheFilepath>',
        'The path where catalog cache file located. (relative of workspace)',
      )
      .option(
        '--files-only, --filesOnly',
        'Determines whether `plainRootDir` represents the root directory of source files' +
          ' or the root directory of a git repository containing the source files.',
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
    const { subCommandName, eventBus, reporter } = this
    const resolvedOptions: O = resolveSubCommandEncryptOptions(
      COMMAND_NAME,
      subCommandName,
      args,
      options,
      reporter,
    )
    const context: C = await createEncryptContextFromOptions(resolvedOptions)
    const processor: IGitCipherSubCommandProcessor<O, C> = new GitCipherEncrypt({
      context,
      eventBus,
      reporter,
    })
    return processor
  }
}
