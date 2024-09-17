import { Command } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../shared/constant'
import type { IToolFileSubCommand, IToolFileSubCommandProcessor } from '../_base'
import { ToolFileSubCommand } from '../_base'
import { type IToolFileSplitContext, createFileSplitContextFromOptions } from './context'
import type { IToolFileSplitOptions } from './option'
import { resolveSubCommandSplitOptions } from './option'
import { ToolFileSplit } from './process'

type O = IToolFileSplitOptions
type C = IToolFileSplitContext

export class ToolFileSubCommandSplit
  extends ToolFileSubCommand<O, C>
  implements IToolFileSubCommand<O, C>
{
  public override readonly subCommandName: string = 'split'
  public override readonly aliases: string[] = ['s']

  public override command(processor: IToolFileSubCommandProcessor<O, C>): Command {
    const { subCommandName, aliases } = this
    const command = new Command()

    command
      .name(subCommandName)
      .aliases(aliases)
      .arguments('<filepath>')
      .description('Split big file into multiple parts.')
      .option('--part-size, --partSize <partSize>', 'Maximum bytes of each file part.')
      .option(
        '--part-total, --partTotal <partTotal>',
        'Number of file parts, works only when <partSize> not specified.',
      )
      .action(async function (args: string[], options: IToolFileSplitOptions) {
        await processor.process(args, options)
      })

    return command
  }

  public override async resolveProcessor(
    args: string[],
    options: O,
  ): Promise<IToolFileSubCommandProcessor<O, C>> {
    const { subCommandName, reporter } = this
    const resolvedOptions: O = resolveSubCommandSplitOptions(
      COMMAND_NAME,
      subCommandName,
      args,
      options,
      reporter,
    )
    const context: C = await createFileSplitContextFromOptions(resolvedOptions)
    const processor: IToolFileSubCommandProcessor<O, C> = new ToolFileSplit({ context, reporter })
    return processor
  }
}
