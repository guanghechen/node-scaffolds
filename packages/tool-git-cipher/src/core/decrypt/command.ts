import type {
  CommandConfigurationFlatOpts,
  SubCommandProcessor,
} from '@guanghechen/commander-helper'
import { Command } from '@guanghechen/commander-helper'
import { absoluteOfWorkspace } from '@guanghechen/file-helper'
import { cover } from '@guanghechen/option-helper'
import { packageName } from '../../env/constant'
import { logger } from '../../env/logger'
import type { GlobalCommandOptions } from '../option'
import {
  __defaultGlobalCommandOptions,
  resolveGlobalCommandOptions,
} from '../option'
import type { GitCipherDecryptContext } from './context'
import { createGitCipherDecryptContext } from './context'

interface SubCommandOptions extends GlobalCommandOptions {
  /**
   * root dir of outputs
   * @default null
   */
  readonly outDir: string | null
}

const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
  outDir: null,
}

export type SubCommandDecryptOptions = SubCommandOptions &
  CommandConfigurationFlatOpts

/**
 * create Sub-command: decrypt (e)
 */
export const createSubCommandDecrypt = function (
  handle?: SubCommandProcessor<SubCommandDecryptOptions>,
  commandName = 'decrypt',
  aliases: string[] = ['d'],
): Command {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .option('--out-dir <outDir>', 'root dir of outputs (decrypted files)')
    .action(async function (
      [_workspaceDir],
      options: SubCommandDecryptOptions,
    ) {
      logger.setName(commandName)

      const defaultOptions: SubCommandDecryptOptions =
        resolveGlobalCommandOptions(
          packageName,
          commandName,
          __defaultCommandOptions,
          _workspaceDir,
          options,
        )

      // resolve outDir
      const outDir: string | null = (() => {
        const _rawOutDir = cover<string | null>(
          defaultOptions.outDir,
          options.outDir,
        )
        if (_rawOutDir == null) return null
        return absoluteOfWorkspace(defaultOptions.workspace, _rawOutDir)
      })()
      logger.debug('outDir:', outDir)

      const resolvedOptions: SubCommandDecryptOptions = {
        ...defaultOptions,
        outDir,
      }

      if (handle != null) {
        await handle(resolvedOptions)
      }
    })

  return command
}

/**
 * Create GitCipherDecryptContext
 * @param options
 */
export async function createGitCipherDecryptContextFromOptions(
  options: SubCommandDecryptOptions,
): Promise<GitCipherDecryptContext> {
  const context: GitCipherDecryptContext = await createGitCipherDecryptContext({
    cwd: options.cwd,
    workspace: options.workspace,
    encoding: options.encoding,
    secretFilepath: options.secretFilepath,
    secretFileEncoding: options.secretFileEncoding,
    indexFilepath: options.indexFilepath,
    indexFileEncoding: options.indexFileEncoding,
    ciphertextRootDir: options.ciphertextRootDir,
    plaintextRootDir: options.plaintextRootDir,
    showAsterisk: options.showAsterisk,
    minPasswordLength: options.minPasswordLength,
    maxPasswordLength: options.maxPasswordLength,
    maxTargetFileSize: options.maxTargetFileSize,
    outDir: options.outDir,
  })
  return context
}
