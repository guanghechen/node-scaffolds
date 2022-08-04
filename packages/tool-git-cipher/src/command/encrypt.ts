import type {
  ISubCommandExecutor,
  ISubCommandMounter,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import { createSubCommandExecutor, createSubCommandMounter } from '@guanghechen/helper-commander'
import type { SubCommandEncryptOptions } from '../core/encrypt/command'
import {
  createGitCipherEncryptContextFromOptions,
  createSubCommandEncrypt,
} from '../core/encrypt/command'
import type { IGitCipherEncryptContext } from '../core/encrypt/context'
import { GitCipherEncryptProcessor } from '../core/encrypt/processor'
import { handleError } from './_util'

/**
 * Process sub-command: 'encrypt'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandEncrypt: ISubCommandProcessor<SubCommandEncryptOptions> =
  async function (options: SubCommandEncryptOptions): Promise<void> {
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

/**
 * Mount Sub-command: encrypt
 *
 * @param {Command}   parentCommand
 * @returns {void}
 */
export const mountSubCommandEncrypt: ISubCommandMounter =
  createSubCommandMounter<SubCommandEncryptOptions>(
    createSubCommandEncrypt,
    processSubCommandEncrypt,
  )

/**
 * Execute sub-command: 'encrypt'
 *
 * @param {Command}   parentCommand
 * @param {string[]}  args
 * @returns {Promise}
 */
export const execSubCommandEncrypt: ISubCommandExecutor =
  createSubCommandExecutor<SubCommandEncryptOptions>(
    createSubCommandEncrypt,
    processSubCommandEncrypt,
  )
