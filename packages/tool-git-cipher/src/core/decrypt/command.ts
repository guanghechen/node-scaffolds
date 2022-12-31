import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { Command } from '@guanghechen/helper-commander'
import { cover } from '@guanghechen/helper-option'
import { absoluteOfWorkspace } from '@guanghechen/helper-path'
import { PACKAGE_NAME } from '../../env/constant'
import { logger } from '../../env/logger'
import { resolveGlobalCommandOptions } from '../option'
import type { ISubCommandDecryptOptions } from './option'
import { getDefaultCommandDecryptOptions } from './option'
/**
 * create Sub-command: decrypt (e)
 */
export const createSubCommandDecrypt = function (
  handle?: ISubCommandProcessor<ISubCommandDecryptOptions>,
  commandName = 'decrypt',
  aliases: string[] = ['d'],
): Command {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .option('--out-dir <outDir>', 'root dir of outputs (decrypted files)')
    .action(async function ([_workspaceDir], options: ISubCommandDecryptOptions) {
      logger.setName(commandName)

      const defaultOptions: ISubCommandDecryptOptions = resolveGlobalCommandOptions(
        PACKAGE_NAME,
        commandName,
        getDefaultCommandDecryptOptions(),
        _workspaceDir,
        options,
      )

      // resolve outDir
      const outDir: string | null = (() => {
        const _rawOutDir = cover<string | null>(defaultOptions.outDir, options.outDir)
        if (_rawOutDir == null) return null
        return absoluteOfWorkspace(defaultOptions.workspace, _rawOutDir)
      })()
      logger.debug('outDir:', outDir)

      const resolvedOptions: ISubCommandDecryptOptions = {
        ...defaultOptions,
        outDir,
      }

      if (handle != null) {
        await handle(resolvedOptions)
      }
    })

  return command
}
