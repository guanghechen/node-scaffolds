import { createSubCommandExecutor, createSubCommandMounter } from '@guanghechen/commander-helper'
import type {
  SubCommandExecutor,
  SubCommandMounter,
  SubCommandProcessor,
} from '@guanghechen/commander-helper'
import type { SubCommandDecryptOptions } from '../core/decrypt/command'
import {
  createGitCipherDecryptContextFromOptions,
  createSubCommandDecrypt,
} from '../core/decrypt/command'
import type { GitCipherDecryptContext } from '../core/decrypt/context'
import { GitCipherDecryptProcessor } from '../core/decrypt/processor'
import { handleError } from './_util'

/**
 * Process sub-command: 'decrypt'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandDecrypt: SubCommandProcessor<SubCommandDecryptOptions> =
  async function (options: SubCommandDecryptOptions): Promise<void> {
    try {
      const context: GitCipherDecryptContext = await createGitCipherDecryptContextFromOptions(
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
export const mountSubCommandDecrypt: SubCommandMounter =
  createSubCommandMounter<SubCommandDecryptOptions>(
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
export const execSubCommandDecrypt: SubCommandExecutor =
  createSubCommandExecutor<SubCommandDecryptOptions>(
    createSubCommandDecrypt,
    processSubCommandDecrypt,
  )
