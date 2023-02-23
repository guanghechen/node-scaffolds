import { createSubCommandExecutor, createSubCommandMounter } from '@guanghechen/helper-commander'
import type {
  ISubCommandExecutor,
  ISubCommandMounter,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import { createSubCommandCat } from '../core/cat/command'
import { createGitCipherCatContextFromOptions } from '../core/cat/context'
import type { IGitCipherCatContext } from '../core/cat/context'
import type { ISubCommandCatOptions } from '../core/cat/option'
import { GitCipherCatProcessor } from '../core/cat/processor'
import { handleError } from '../util/events'

// Process sub-command: cat
export const processSubCommandCat: ISubCommandProcessor<ISubCommandCatOptions> = async (
  options: ISubCommandCatOptions,
): Promise<void> => {
  try {
    const context: IGitCipherCatContext = await createGitCipherCatContextFromOptions(options)
    const processor = new GitCipherCatProcessor(context)
    await processor.cat()
  } catch (error) {
    handleError(error)
  }
}

// Mount Sub-command: cat
export const mountSubCommandCat: ISubCommandMounter =
  createSubCommandMounter<ISubCommandCatOptions>(createSubCommandCat, processSubCommandCat)

// Execute sub-command: cat
export const execSubCommandCat: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandCatOptions>(createSubCommandCat, processSubCommandCat)
