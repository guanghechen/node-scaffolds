import type { CommandConfigurationFlatOpts } from '@guanghechen/commander-helper'
import { Command } from '@guanghechen/commander-helper'
import { coverBoolean } from '@guanghechen/option-helper'
import { packageName } from '../../env/constant'
import { logger } from '../../env/logger'
import type { GlobalCommandOptions } from '../option'
import {
  __defaultGlobalCommandOptions,
  resolveGlobalCommandOptions,
} from '../option'
import type { GitCipherEncryptContext } from './context'
import { createGitCipherEncryptContext } from './context'

interface SubCommandOptions extends GlobalCommandOptions {
  /**
   * Whether to update in full, if not, only update files whose mtime is less
   * than the mtime recorded in the index file
   */
  readonly full: boolean
  /**
   * Perform `git fetch --all` before encrypt
   */
  readonly updateBeforeEncrypt: boolean
}

const __defaultCommandOptions: SubCommandOptions = {
  ...__defaultGlobalCommandOptions,
  full: false,
  updateBeforeEncrypt: false,
}

export type SubCommandEncryptOptions = SubCommandOptions &
  CommandConfigurationFlatOpts

/**
 * create Sub-command: encrypt (e)
 */
export const createSubCommandEncrypt = function (
  handle?: (options: SubCommandEncryptOptions) => void | Promise<void>,
  commandName = 'encrypt',
  aliases: string[] = ['e'],
): Command {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .option('--full', 'full quantity update')
    .option(
      '--update-before-encrypt',
      "perform 'git fetch --all' before run encryption",
    )
    .action(async function (
      [_workspaceDir],
      options: SubCommandEncryptOptions,
    ) {
      logger.setName(commandName)

      const defaultOptions: SubCommandEncryptOptions =
        resolveGlobalCommandOptions(
          packageName,
          commandName,
          __defaultCommandOptions,
          _workspaceDir,
          options,
        )

      // resolve full
      const full: boolean = coverBoolean(defaultOptions.full, options.full)
      logger.debug('full:', full)

      // resolve updateBeforeEncrypt
      const updateBeforeEncrypt: boolean = coverBoolean(
        defaultOptions.updateBeforeEncrypt,
        options.updateBeforeEncrypt,
      )
      logger.debug('updateBeforeEncrypt:', updateBeforeEncrypt)

      const resolvedOptions: SubCommandEncryptOptions = {
        ...defaultOptions,
        full,
        updateBeforeEncrypt,
      }

      if (handle != null) {
        await handle(resolvedOptions)
      }
    })

  return command
}

/**
 * Create GitCipherEncryptContext
 * @param options
 */
export async function createGitCipherEncryptContextFromOptions(
  options: SubCommandEncryptOptions,
): Promise<GitCipherEncryptContext> {
  const context: GitCipherEncryptContext = await createGitCipherEncryptContext({
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
    full: options.full,
    updateBeforeEncrypt: options.updateBeforeEncrypt,
  })
  return context
}
