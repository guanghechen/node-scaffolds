import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { createDecryptContextFromOptions } from './context'
import type { IGitCipherDecryptContext } from './context'
import type { ISubCommandDecryptOptions } from './option'
import { GitCipherDecryptProcessor } from './processor'

// Process sub-command: decrypt
export const decrypt: ISubCommandProcessor<ISubCommandDecryptOptions> = async (
  options: ISubCommandDecryptOptions,
): Promise<void> => {
  const context: IGitCipherDecryptContext = await createDecryptContextFromOptions(options)
  const processor = new GitCipherDecryptProcessor(context)
  await processor.decrypt()
}
