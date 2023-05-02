import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { createEncryptContextFromOptions } from './context'
import type { IGitCipherEncryptContext } from './context'
import type { ISubCommandEncryptOptions } from './option'
import { GitCipherEncryptProcessor } from './processor'

// Process sub-command: encrypt
export const encrypt: ISubCommandProcessor<ISubCommandEncryptOptions> = async (
  options: ISubCommandEncryptOptions,
): Promise<void> => {
  const context: IGitCipherEncryptContext = await createEncryptContextFromOptions(options)
  const processor = new GitCipherEncryptProcessor(context)
  await processor.encrypt()
}
