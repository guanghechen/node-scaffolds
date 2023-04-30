import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { handleError } from '../../util/events'
import { createGitCipherEncryptContextFromOptions } from './context'
import type { IGitCipherEncryptContext } from './context'
import type { ISubCommandEncryptOptions } from './option'
import { GitCipherEncryptProcessor } from './processor'

// Process sub-command: encrypt
export const encrypt: ISubCommandProcessor<ISubCommandEncryptOptions> = async (
  options: ISubCommandEncryptOptions,
): Promise<void> => {
  try {
    const context: IGitCipherEncryptContext = await createGitCipherEncryptContextFromOptions(
      options,
    )
    const processor = new GitCipherEncryptProcessor(context)
    await processor.encrypt()
  } catch (error) {
    handleError(error)
  }
}
