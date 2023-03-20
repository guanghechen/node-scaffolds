import { createSubCommandExecutor, createSubCommandMounter } from '@guanghechen/helper-commander'
import type {
  ISubCommandExecutor,
  ISubCommandMounter,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import { createSubCommandTree } from '../core/tree/command'
import { createGitCipherTreeContextFromOptions } from '../core/tree/context'
import type { IGitCipherTreeContext } from '../core/tree/context'
import type { ISubCommandTreeOptions } from '../core/tree/option'
import { GitCipherTreeProcessor } from '../core/tree/processor'
import { handleError } from '../util/events'

// Process sub-command: tree
export const processSubCommandTree: ISubCommandProcessor<ISubCommandTreeOptions> = async (
  options: ISubCommandTreeOptions,
): Promise<void> => {
  try {
    const context: IGitCipherTreeContext = await createGitCipherTreeContextFromOptions(options)
    const processor = new GitCipherTreeProcessor(context)
    await processor.tree()
  } catch (error) {
    handleError(error)
  }
}

// Mount Sub-command: tree
export const mountSubCommandTree: ISubCommandMounter =
  createSubCommandMounter<ISubCommandTreeOptions>(createSubCommandTree, processSubCommandTree)

// Execute sub-command: tree
export const execSubCommandTree: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandTreeOptions>(createSubCommandTree, processSubCommandTree)
