import type {
  ISubCommandExecutor,
  ISubCommandMounter,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import { createSubCommandExecutor, createSubCommandMounter } from '@guanghechen/helper-commander'
import { createSubCommandEncrypt } from '../core/encrypt/command'
import { createGitCipherEncryptContextFromOptions } from '../core/encrypt/context'
import type { IGitCipherEncryptContext } from '../core/encrypt/context'
import type { ISubCommandEncryptOptions } from '../core/encrypt/option'
import { GitCipherEncryptProcessor } from '../core/encrypt/processor'
import { handleError } from './_util'

// Process sub-command: 'encrypt'
export const processSubCommandEncrypt: ISubCommandProcessor<ISubCommandEncryptOptions> = async (
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

// Mount Sub-command: encrypt
export const mountSubCommandEncrypt: ISubCommandMounter =
  createSubCommandMounter<ISubCommandEncryptOptions>(
    createSubCommandEncrypt,
    processSubCommandEncrypt,
  )

// Execute sub-command: 'encrypt'
export const execSubCommandEncrypt: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandEncryptOptions>(
    createSubCommandEncrypt,
    processSubCommandEncrypt,
  )
