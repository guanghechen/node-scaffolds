import type {
  SubCommandExecutor,
  SubCommandMounter,
  SubCommandProcessor,
} from '@guanghechen/commander-helper'
import { createSubCommandExecutor, createSubCommandMounter } from '@guanghechen/commander-helper'
import type { SubCommandInitOptions } from '../core/init/command'
import { createGitCipherInitContextFromOptions, createSubCommandInit } from '../core/init/command'
import type { GitCipherInitContext } from '../core/init/context'
import { GitCipherInitProcessor } from '../core/init/processor'
import { handleError } from './_util'

/**
 * Process sub-command: 'init'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandInit: SubCommandProcessor<SubCommandInitOptions> = async function (
  options: SubCommandInitOptions,
): Promise<void> {
  try {
    const context: GitCipherInitContext = await createGitCipherInitContextFromOptions(options)
    const processor = new GitCipherInitProcessor(context)
    await processor.init()
  } catch (error) {
    handleError(error)
  }
}

/**
 * Mount Sub-command: init
 *
 * @param {Command}   parentCommand
 * @returns {void}
 */
export const mountSubCommandInit: SubCommandMounter =
  createSubCommandMounter<SubCommandInitOptions>(createSubCommandInit, processSubCommandInit)

/**
 * Execute sub-command: 'init'
 *
 * @param {Command}   parentCommand
 * @param {string[]}  args
 * @returns {Promise}
 */
export const execSubCommandInit: SubCommandExecutor =
  createSubCommandExecutor<SubCommandInitOptions>(createSubCommandInit, processSubCommandInit)
