import {
  Command,
  createSubCommandExecutor,
  createSubCommandMounter,
} from '@guanghechen/helper-commander'
import type {
  ISubCommandExecutor,
  ISubCommandMounter,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../core/constant'
import type { ISubCommandVerifyOptions } from './option'
import { resolveSubCommandVerifyOptions } from './option'
import { verify } from './run'

// Mount Sub-command: verify
export const mountSubCommandVerify: ISubCommandMounter =
  createSubCommandMounter<ISubCommandVerifyOptions>(createSubCommandVerify, verify)

// Execute sub-command: verify
export const execSubCommandVerify: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandVerifyOptions>(createSubCommandVerify, verify)

// Create Sub-command: verify (v)
export function createSubCommandVerify(
  handle?: ISubCommandProcessor<ISubCommandVerifyOptions>,
  subCommandName = 'verify',
  aliases: string[] = ['v'],
): Command {
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
    .action(async function (args: string[], options: ISubCommandVerifyOptions) {
      const resolvedOptions: ISubCommandVerifyOptions = resolveSubCommandVerifyOptions(
        COMMAND_NAME,
        subCommandName,
        options,
      )
      await handle?.(resolvedOptions, args)
    })

  return command
}
