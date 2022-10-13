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
import { handleError } from './_util'

/**
 * Process sub-command: 'decrypt'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandDecrypt: ISubCommandProcessor<ISubCommandDecryptOptions> =
  async function (options: ISubCommandDecryptOptions): Promise<void> {
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

/**
 * Mount Sub-command: decrypt
 *
 * @param {Command}   parentCommand
 * @returns {void}
 */
export const mountSubCommandDecrypt: ISubCommandMounter =
  createSubCommandMounter<ISubCommandDecryptOptions>(
    createSubCommandDecrypt,
    processSubCommandDecrypt,
  )

/**
 * Execute sub-command: 'decrypt'
 *
 * @param {Command}   parentCommand
 * @param {string[]}  args
 * @returns {Promise}
 */
export const execSubCommandDecrypt: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandDecryptOptions>(
    createSubCommandDecrypt,
    processSubCommandDecrypt,
  )
