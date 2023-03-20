import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../env/constant'
import type { ISubCommandVerifyOptions } from './option'
import { resolveSubCommandVerifyOptions } from './option'

// Create Sub-command: verify (v)
export const createSubCommandVerify = (
  handle?: ISubCommandProcessor<ISubCommandVerifyOptions>,
  subCommandName = 'verify',
  aliases: string[] = ['v'],
): Command => {
  const command = new Command()

  command
    .name(subCommandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .description('Verify if there are any problems in the crypt repo.')
    .option(
      '--catalog-cache-filepath, --catalogCacheFilepath <catalogCacheFilepath>',
      'The path where catalog cache file located. (relative of workspace)',
    )
    .option('--crypt-commit-id, --cryptCommitId <commitHash>', 'Crypt repo branch or commit id.')
    .option('--plain-commit-id, --plainCommitId <commitHash>', 'Plain repo branch or commit id.')
    .action(async function ([_workspaceDir], options: ISubCommandVerifyOptions) {
      const resolvedOptions: ISubCommandVerifyOptions = resolveSubCommandVerifyOptions(
        COMMAND_NAME,
        subCommandName,
        _workspaceDir,
        options,
      )
      await handle?.(resolvedOptions)
    })

  return command
}
