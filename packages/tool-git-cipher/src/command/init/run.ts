import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { handleError } from '../../util/events'
import { createGitCipherInitContextFromOptions } from './context'
import type { IGitCipherInitContext } from './context'
import type { ISubCommandInitOptions } from './option'
import { GitCipherInitProcessor } from './processor'

// Process sub-command: init
export const init: ISubCommandProcessor<ISubCommandInitOptions> = async (
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
