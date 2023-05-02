import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { createInitContextFromOptions } from './context'
import type { IGitCipherInitContext } from './context'
import type { ISubCommandInitOptions } from './option'
import { GitCipherInitProcessor } from './processor'

// Process sub-command: init
export const init: ISubCommandProcessor<ISubCommandInitOptions> = async (
  options: ISubCommandInitOptions,
): Promise<void> => {
  const context: IGitCipherInitContext = await createInitContextFromOptions(options)
  const processor = new GitCipherInitProcessor(context)
  await processor.init()
}
