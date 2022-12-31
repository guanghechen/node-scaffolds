import { Command } from '@guanghechen/helper-commander'
import { isNotEmptyArray } from '@guanghechen/helper-is'
import { cover, coverBoolean } from '@guanghechen/helper-option'
import path from 'node:path'
import { PACKAGE_NAME } from '../../env/constant'
import { logger } from '../../env/logger'
import { resolveGlobalCommandOptions } from '../option'
import type { ISubCommandEncryptOptions } from './option'
import { getDefaultCommandEncryptOptions } from './option'

/**
 * create Sub-command: encrypt (e)
 */
export const createSubCommandEncrypt = function (
  handle?: (options: ISubCommandEncryptOptions) => void | Promise<void>,
  commandName = 'encrypt',
  aliases: string[] = ['e'],
): Command {
  const command = new Command()

  command
    .name(commandName)
    .aliases(aliases)
    .arguments('<workspace>')
    .option('--full', 'full quantity update')
    .option('--update-before-encrypt', "perform 'git fetch --all' before run encryption")
    .action(async function ([_workspaceDir], options: ISubCommandEncryptOptions) {
      logger.setName(commandName)

      const defaultOptions: ISubCommandEncryptOptions = resolveGlobalCommandOptions(
        PACKAGE_NAME,
        commandName,
        getDefaultCommandEncryptOptions(),
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

      // resolve sensitiveDirectories
      const sensitiveDirectories: string[] = [
        ...new Set<string>(
          cover<string[]>(
            defaultOptions.sensitiveDirectories.slice(),
            options.sensitiveDirectories,
            isNotEmptyArray,
          ).map(p => path.normalize(p)),
        ),
      ]
      logger.debug('sensitiveDirectories:', sensitiveDirectories)

      const resolvedOptions: ISubCommandEncryptOptions = {
        ...defaultOptions,
        full,
        updateBeforeEncrypt,
        sensitiveDirectories,
      }

      if (handle != null) {
        await handle(resolvedOptions)
      }
    })

  return command
}
