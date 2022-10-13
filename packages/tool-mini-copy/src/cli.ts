import path from 'path'
import type { IGlobalCommandOptions } from '.'
import {
  __defaultGlobalCommandOptions,
  createProgram,
  handleCommand,
  logger,
  packageName,
  resolveGlobalCommandOptions,
} from '.'

const program = createProgram()

program
  .action(async function (args: string[], options: IGlobalCommandOptions): Promise<void> {
    const resolvedOptions = resolveGlobalCommandOptions(
      packageName,
      '',
      __defaultGlobalCommandOptions,
      path.resolve(),
      options,
    )
    const sourceContent = args[0]
    await handleCommand(sourceContent, resolvedOptions)
  })
  .parseAsync(process.argv)
  .catch(error => {
    logger.error(error)
  })
