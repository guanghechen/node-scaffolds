import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { wrapErrorHandler } from '../../core/error'
import { createInitContextFromOptions } from './context'
import type { IGitCipherInitContext } from './context'
import type { ISubCommandInitOptions } from './option'
import { GitCipherInitProcessor } from './processor'

// Process sub-command: init
export const init: ISubCommandProcessor<ISubCommandInitOptions> = wrapErrorHandler(
  async (options: ISubCommandInitOptions): Promise<void> => {
    const context: IGitCipherInitContext = await createInitContextFromOptions(options)
    const processor = new GitCipherInitProcessor(context)
    await processor.init()
  },
)
