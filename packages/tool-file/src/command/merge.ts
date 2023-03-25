import { createSubCommandExecutor, createSubCommandMounter } from '@guanghechen/helper-commander'
import type {
  ISubCommandExecutor,
  ISubCommandMounter,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import { createSubCommandMerge } from '../core/merge/command'
import { createFileMergeContextFromOptions } from '../core/merge/context'
import type { IFileMergeContext } from '../core/merge/context'
import type { ISubCommandMergeOptions } from '../core/merge/option'
import { FileMergeProcessor } from '../core/merge/processor'

// Process sub-command: merge
export const processSubCommandMerge: ISubCommandProcessor<ISubCommandMergeOptions> = async (
  options: ISubCommandMergeOptions,
  args: string[],
): Promise<void> => {
  const context: IFileMergeContext = await createFileMergeContextFromOptions(options)
  const processor = new FileMergeProcessor(context)
  await processor.merge(args)
}

// Mount Sub-command: merge
export const mountSubCommandMerge: ISubCommandMounter =
  createSubCommandMounter<ISubCommandMergeOptions>(createSubCommandMerge, processSubCommandMerge)

// Execute sub-command: merge
export const execSubCommandMerge: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandMergeOptions>(createSubCommandMerge, processSubCommandMerge)
