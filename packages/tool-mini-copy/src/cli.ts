import type { IGlobalCommandOptions } from '.'
import {
  PACKAGE_NAME,
  __defaultGlobalCommandOptions,
  createProgram,
  handleCommand,
  logger,
  resolveGlobalCommandOptions,
} from '.'

const program = createProgram()

program
  .action(async function (args: string[], options: IGlobalCommandOptions): Promise<void> {
    const resolvedOptions = resolveGlobalCommandOptions(
      PACKAGE_NAME,
      '',
      __defaultGlobalCommandOptions,
      options,
    )
    const sourceContent = args[0]
    await handleCommand(sourceContent, resolvedOptions)
  })
  .parseAsync(process.argv)
  .catch(error => {
    logger.error(error)
  })
