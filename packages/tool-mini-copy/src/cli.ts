import {
  type IGlobalCommandOptions,
  PACKAGE_NAME,
  __defaultGlobalCommandOptions,
  createProgram,
  handleCommand,
  reporter,
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
    reporter.error(error)
  })
