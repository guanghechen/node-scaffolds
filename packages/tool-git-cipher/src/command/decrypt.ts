import { createSubCommandExecutor, createSubCommandMounter } from '@guanghechen/helper-commander'
import type {
  ISubCommandExecutor,
  ISubCommandMounter,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import { createSubCommandDecrypt } from '../core/decrypt/command'
import { createGitCipherDecryptContextFromOptions } from '../core/decrypt/context'
import type { IGitCipherDecryptContext } from '../core/decrypt/context'
import type { ISubCommandDecryptOptions } from '../core/decrypt/option'
import { GitCipherDecryptProcessor } from '../core/decrypt/processor'
import { handleError } from '../util/events'

// Process sub-command: decrypt
export const processSubCommandDecrypt: ISubCommandProcessor<ISubCommandDecryptOptions> = async (
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

// Mount Sub-command: decrypt
export const mountSubCommandDecrypt: ISubCommandMounter =
  createSubCommandMounter<ISubCommandDecryptOptions>(
    createSubCommandDecrypt,
    processSubCommandDecrypt,
  )

// Execute sub-command: decrypt
export const execSubCommandDecrypt: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandDecryptOptions>(
    createSubCommandDecrypt,
    processSubCommandDecrypt,
  )
