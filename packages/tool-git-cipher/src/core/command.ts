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
    .option('--encoding <encoding>', 'default encoding of files in the workspace')
    .option('--secret-filepath <secretFilepath>', 'path of secret file')
    .option('--catalog-filepath <catalogFilepath>', 'path of catalog file of ciphertext files')
    .option('--crypt-rootDir <cryptRootDir>', 'the directory where the encrypted files are stored')
    .option(
      '--plain-rootDir <plainRootDir>',
      'the directory where the source plaintext files are stored',
    )
    .option('--show-asterisk', 'whether to print password asterisks')
    .option('--minimum-password-length', 'the minimum size required of password')

  return program
}
