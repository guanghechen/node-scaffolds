import type { Command } from '@guanghechen/helper-commander'
import { createTopCommand } from '@guanghechen/helper-commander'
import { COMMAND_NAME, COMMAND_VERSION } from '../env/constant'

/**
 * Create a top commander instance with default global options
 */
export function createProgram(): Command {
  const program = createTopCommand(COMMAND_NAME, COMMAND_VERSION)

  // global options
  program
    .option(
      '--catalog-cache-filepath <catalogCacheFilepath>',
      'The path of catalog cache file of crypt repo. (relative of workspace)',
    )
    .option(
      '--crypt-root-dir <cryptRootDir>',
      'The directory where the crypt repo located. (relative of workspace or absolute path)',
    )
    .option('--encoding <encoding>', 'Default encoding of files in the workspace.')
    .option('--max-password-length <maxPasswordLength>', 'The maximum size required of password')
    .option('--max-retry-times <maxRetryTimes>', 'Max wrong password retry times')
    .option('--min-password-length <minPasswordLength>', 'the minimum size required of password')
    .option(
      '--plain-root-dir <plainRootDir>',
      'The directory where the plain repo located. (relative of workspace or absolute path)',
    )
    .option(
      '--secret-filepath <secretFilepath>',
      'The path of secret file. (relative of workspace)',
    )
    .option('--show-asterisk', `Print password asterisk.`)
    .option('--no-show-asterisk', `Don't print password asterisks.`)

  return program
}
