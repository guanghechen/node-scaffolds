import { Command } from '@guanghechen/helper-commander'
import { COMMAND_NAME } from '../../shared/constant'
import type { IToolFileSubCommand, IToolFileSubCommandProcessor } from '../_base'
import { ToolFileSubCommand } from '../_base'
import { type IToolFileMergeContext, createFileMergeContextFromOptions } from './context'
import type { IToolFileMergeOptions } from './option'
import { resolveSubCommandMergeOptions } from './option'
import { ToolFileMerge } from './process'

type O = IToolFileMergeOptions
type C = IToolFileMergeContext

export class ToolFileSubCommandMerge
  extends ToolFileSubCommand<O, C>
  implements IToolFileSubCommand<O, C>
{
  public override readonly subCommandName: string = 'merge'
  public override readonly aliases: string[] = ['m']

  public override command(processor: IToolFileSubCommandProcessor<O, C>): Command {
    const { subCommandName, aliases } = this
    const command = new Command()

    command
      .name(subCommandName)
      .aliases(aliases)
      .arguments('<filepath>')
      .description('Merge file parts into the big file.')
      .action(async function (args: string[], options: IToolFileMergeOptions) {
        await processor.process(args, options)
      })

    return command
  }

  public override async resolve(
    _args: string[],
    options: O,
  ): Promise<IToolFileSubCommandProcessor<O, C>> {
    const { subCommandName, reporter } = this
    const resolvedOptions: O = resolveSubCommandMergeOptions(COMMAND_NAME, subCommandName, options)
    const context: C = await createFileMergeContextFromOptions(resolvedOptions)
    const processor: IToolFileSubCommandProcessor<O, C> = new ToolFileMerge({ context, reporter })
    return processor
  }
}
