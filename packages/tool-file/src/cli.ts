// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import type { ISubCommand, ISubCommandOptions } from '@guanghechen/helper-commander'
import type { IReporter } from '@guanghechen/reporter'
import { Reporter } from '@guanghechen/reporter'
import type { IToolFileSubCommandProps } from './command/_base'
import { COMMAND_NAME, ToolFileSubCommandMerge, ToolFileSubCommandSplit, createProgram } from '.'

const reporter: IReporter = new Reporter(
  chalk,
  {
    baseName: COMMAND_NAME,
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
