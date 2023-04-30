import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { handleError } from '../../util/events'
import { createGitCipherDecryptContextFromOptions } from './context'
import type { IGitCipherDecryptContext } from './context'
import type { ISubCommandDecryptOptions } from './option'
import { GitCipherDecryptProcessor } from './processor'

// Process sub-command: decrypt
export const decrypt: ISubCommandProcessor<ISubCommandDecryptOptions> = async (
  options: ISubCommandDecryptOptions,
): Promise<void> => {
  try {
    const context: IGitCipherDecryptContext = await createGitCipherDecryptContextFromOptions(
      options,
    )
    const processor = new GitCipherDecryptProcessor(context)
    await processor.decrypt()
  } catch (error) {
    handleError(error)
  }
}
