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
      '--part-code-prefix, --partCodePrefix <partCodePrefix>',
      `The prefix of the each file part code`,
    )
    .option('--part-size, --partSize <partSize>', `Maximum bytes of each file part.`)
    .option(
      '--part-total, --partTotal <partTotal>',
      `Number of file parts, works only when <partSize> not specified.`,
    )
  return program
}
