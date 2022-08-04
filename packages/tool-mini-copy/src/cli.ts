import path from 'path'
import type { IGlobalCommandOptions } from '.'
import {
  __defaultGlobalCommandOptions,
  createProgram,
  handleCommand,
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
  .parse(process.argv)
