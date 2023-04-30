import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { handleError } from '../../util/events'
import { createGitCipherTreeContextFromOptions } from './context'
import type { IGitCipherTreeContext } from './context'
import type { ISubCommandTreeOptions } from './option'
import { GitCipherTreeProcessor } from './processor'

// Process sub-command: tree
export const tree: ISubCommandProcessor<ISubCommandTreeOptions> = async (
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
