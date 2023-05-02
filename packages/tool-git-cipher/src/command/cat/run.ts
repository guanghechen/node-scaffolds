import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { createCatContextFromOptions } from './context'
import type { IGitCipherCatContext } from './context'
import type { ISubCommandCatOptions } from './option'
import { GitCipherCatProcessor } from './processor'

// Process sub-command: cat
export const cat: ISubCommandProcessor<ISubCommandCatOptions> = async (
  options: ISubCommandCatOptions,
): Promise<void> => {
  const context: IGitCipherCatContext = await createCatContextFromOptions(options)
  const processor = new GitCipherCatProcessor(context)
  await processor.cat()
}
