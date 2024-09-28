import type { Command } from '@guanghechen/commander'
import { createTopCommand } from '@guanghechen/commander'
import { COMMAND_NAME, COMMAND_VERSION } from '../shared/constant'

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
      'The prefix of the each file part code',
    )
  return program
}
