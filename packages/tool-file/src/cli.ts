import { ChalkLogger } from '@guanghechen/chalk-logger'
import type { ISubCommand, ISubCommandOptions } from '@guanghechen/helper-commander'
import type { IToolFileSubCommandProps } from './command/_base'
import { COMMAND_NAME, ToolFileSubCommandMerge, ToolFileSubCommandSplit, createProgram } from '.'

const reporter = new ChalkLogger(
  {
    name: COMMAND_NAME,
    flights: {
      colorful: true,
      date: false,
      inline: false,
      title: true,
    },
  },
  process.argv,
)

const program = createProgram()

const commandProps: IToolFileSubCommandProps = { reporter }
const commands: Array<ISubCommand<ISubCommandOptions>> = [
  new ToolFileSubCommandMerge(commandProps),
  new ToolFileSubCommandSplit(commandProps),
]

program.parseAsync(process.argv).catch(error => reporter.error(error))
for (const subCommand of commands) {
  subCommand.mount(program, undefined)
}

program
  .parseAsync(process.argv) //
  .catch(error => reporter.error(error))
