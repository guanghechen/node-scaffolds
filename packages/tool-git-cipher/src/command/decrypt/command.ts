import { Command } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../shared/core/constant'
import type { IGitCipherSubCommand, IGitCipherSubCommandProcessor } from '../_base'
import { GitCipherSubCommand } from '../_base'
import { type IGitCipherDecryptContext, createDecryptContextFromOptions } from './context'
import type { IGitCipherDecryptOption } from './option'
import { resolveSubCommandDecryptOptions } from './option'
import { GitCipherDecrypt } from './process'

type O = IGitCipherDecryptOption
type C = IGitCipherDecryptContext

export class GitCipherSubCommandDecrypt
  extends GitCipherSubCommand<O, C>
  implements IGitCipherSubCommand<O, C>
{
  public override readonly subCommandName: string = 'decrypt'
  public override readonly aliases: string[] = ['d']

  public override command(processor: IGitCipherSubCommandProcessor<O, C>): Command {
    const { subCommandName, aliases } = this
    const command = new Command()

    command
      .name(subCommandName)
      .aliases(aliases)
      .description('Decrypt git repo or decrypt files on a branch/commit only.')
      .option(
        '--catalog-cache-filepath, --catalogCacheFilepath <catalogCacheFilepath>',
        'The path where catalog cache file located. (relative of workspace)',
      )
      .option(
        '--files-at, --filesAt [commitHash]',
        'Decrypt files only at the given commit id or branch.',
      )
      .option(
        '--files-only, --filesOnly <filesOnly>',
        'Specify which files need to decrypt.',
        (val, acc: string[]) => acc.concat(val),
        [],
      )
      .option('--git-gpg-sign', `Config git commit.gpgSign to 'true'.`)
      .option('--no-git-gpg-sign', `Config git commit.gpgSign to 'false'.`)
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
    const resolvedOptions: O = resolveSubCommandDecryptOptions(
      COMMAND_NAME,
      subCommandName,
      options,
    )
    const context: C = await createDecryptContextFromOptions(resolvedOptions)
    const processor: IGitCipherSubCommandProcessor<O, C> = new GitCipherDecrypt({
      context,
      eventBus,
      reporter,
    })
    return processor
  }
}
