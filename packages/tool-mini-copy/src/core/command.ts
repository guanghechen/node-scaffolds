import type { Command } from '@guanghechen/commander'
import { createTopCommand } from '@guanghechen/commander'
import { COMMAND_NAME, COMMAND_VERSION } from '../env/constant'

/**
 * Create a top commander instance with default global options
 */
export function createProgram(): Command {
  const program = createTopCommand(COMMAND_NAME, COMMAND_VERSION)

  // Global command options
  program
    .argument('[source content]')
    .option('-e, --encoding <encoding>', 'Encoding of content from stdin or file.')
    .option('-i, --input <filepath>', 'Copy the data from <filepath> to the system clipboard.')
    .option('-o, --output <filepath>', 'Write the data from the system clipboard into <filepath>.')
    .option(
      '-f, --force',
      'Paste the content from the system clipboard to the <filepath> without confirmation.',
    )
    .option('-s, --silence', "Don't print info-level log.")
    .option('--fake-clipboard [local filepath]', 'Specify a fake clipboard.')
    .option('--strip-ansi', 'Strip ansi escape codes.')

  return program
}
