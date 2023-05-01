import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { wrapErrorHandler } from '../../core/error'
import { createTreeContextFromOptions } from './context'
import type { IGitCipherTreeContext } from './context'
import type { ISubCommandTreeOptions } from './option'
import { GitCipherTreeProcessor } from './processor'

// Process sub-command: tree
export const tree: ISubCommandProcessor<ISubCommandTreeOptions> = wrapErrorHandler(
  async (options: ISubCommandTreeOptions): Promise<void> => {
    const context: IGitCipherTreeContext = await createTreeContextFromOptions(options)
    const processor = new GitCipherTreeProcessor(context)
    await processor.tree()
  },
)
