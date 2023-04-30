import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { handleError } from '../../util/events'
import { createGitCipherCatContextFromOptions } from './context'
import type { IGitCipherCatContext } from './context'
import type { ISubCommandCatOptions } from './option'
import { GitCipherCatProcessor } from './processor'

// Process sub-command: cat
export const cat: ISubCommandProcessor<ISubCommandCatOptions> = async (
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
