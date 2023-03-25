import { createSubCommandExecutor, createSubCommandMounter } from '@guanghechen/helper-commander'
import type {
  ISubCommandExecutor,
  ISubCommandMounter,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import { createSubCommandSplit } from '../core/split/command'
import { createFileSplitContextFromOptions } from '../core/split/context'
import type { IFileSplitContext } from '../core/split/context'
import type { ISubCommandSplitOptions } from '../core/split/option'
import { FileSplitProcessor } from '../core/split/processor'

// Process sub-command: split
export const processSubCommandSplit: ISubCommandProcessor<ISubCommandSplitOptions> = async (
  options: ISubCommandSplitOptions,
  args: string[],
): Promise<void> => {
  const context: IFileSplitContext = await createFileSplitContextFromOptions(options)
  const processor = new FileSplitProcessor(context)
  await processor.split(args)
}

// Mount Sub-command: split
export const mountSubCommandSplit: ISubCommandMounter =
  createSubCommandMounter<ISubCommandSplitOptions>(createSubCommandSplit, processSubCommandSplit)

// Execute sub-command: split
export const execSubCommandSplit: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandSplitOptions>(createSubCommandSplit, processSubCommandSplit)
