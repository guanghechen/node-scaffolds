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
    .option('--output <output>', 'Specify the output filepath.')
    .option(
      '--part-code-prefix, --partCodePrefix <partCodePrefix>',
      `The prefix of the each file part code`,
    )
  return program
}
