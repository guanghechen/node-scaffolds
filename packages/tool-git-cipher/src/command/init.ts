import type {
  ISubCommandExecutor,
  ISubCommandMounter,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import { createSubCommandExecutor, createSubCommandMounter } from '@guanghechen/helper-commander'
import { createSubCommandInit } from '../core/init/command'
import { createGitCipherInitContextFromOptions } from '../core/init/context'
import type { IGitCipherInitContext } from '../core/init/context'
import type { ISubCommandInitOptions } from '../core/init/option'
import { GitCipherInitProcessor } from '../core/init/processor'
import { handleError } from '../util/events'

// Process sub-command: init
export const processSubCommandInit: ISubCommandProcessor<ISubCommandInitOptions> = async (
  options: ISubCommandInitOptions,
): Promise<void> => {
  try {
    const context: IGitCipherInitContext = await createGitCipherInitContextFromOptions(options)
    const processor = new GitCipherInitProcessor(context)
    await processor.init()
  } catch (error) {
    handleError(error)
  }
}

// Mount Sub-command: init
export const mountSubCommandInit: ISubCommandMounter =
  createSubCommandMounter<ISubCommandInitOptions>(createSubCommandInit, processSubCommandInit)

// Execute sub-command: init
export const execSubCommandInit: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandInitOptions>(createSubCommandInit, processSubCommandInit)
