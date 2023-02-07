import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { cover } from '@guanghechen/helper-option'
import { absoluteOfWorkspace } from '@guanghechen/helper-path'
import { PACKAGE_NAME } from '../../env/constant'
import { logger } from '../../env/logger'
import { resolveGlobalCommandOptions } from '../option'
import type { ISubCommandDecryptOptions } from './option'
import { getDefaultCommandDecryptOptions } from './option'

// Create Sub-command: decrypt (e)
export const createSubCommandDecrypt = (
  handle?: ISubCommandProcessor<ISubCommandDecryptOptions>,
  commandName = 'decrypt',
  aliases: string[] = ['d'],
): Command => {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .option('--outDir <outDir>', 'specify the root dir of decrypted files.')
    .option(
      '--filesAt [filesAt]',
      '(commit id | branch) decrypt files at the given commit id or branch.',
      'HEAD',
    )
    .action(async function ([_workspaceDir], options: ISubCommandDecryptOptions) {
      logger.setName(commandName)

      const defaultOptions: ISubCommandDecryptOptions = resolveGlobalCommandOptions(
        PACKAGE_NAME,
        commandName,
        getDefaultCommandDecryptOptions(),
        _workspaceDir,
        options,
      )

      // Resolve outDir
      const outDir: string | null = (() => {
        const _rawOutDir = cover<string | null>(defaultOptions.outDir, options.outDir)
        if (_rawOutDir == null) return null
        return absoluteOfWorkspace(defaultOptions.workspace, _rawOutDir)
      })()
      logger.debug('outDir:', outDir)

      // Resolve filesAt
      const filesAt: string | null = cover<string | null>(defaultOptions.filesAt, options.filesAt)
      logger.debug('filesAt:', filesAt)

      const resolvedOptions: ISubCommandDecryptOptions = { ...defaultOptions, outDir, filesAt }
      await handle?.(resolvedOptions)
    })

  return command
}
