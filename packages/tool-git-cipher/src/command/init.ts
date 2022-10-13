import type {
  ISubCommandExecutor,
  ISubCommandMounter,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import { createSubCommandExecutor, createSubCommandMounter } from '@guanghechen/helper-commander'
import { createSubCommandInit } from '../core/init/command'
import { createGitCipherInitContextFromOptions } from '../core/init/context'
import type { IGitCipherInitContext } from '../core/init/context'
import type { ISubCommandInitOptions } from '../core/init/option'
import { GitCipherInitProcessor } from '../core/init/processor'
import { handleError } from './_util'

/**
 * Process sub-command: 'init'
 *
 * @param options
 * @returns {void|Promise<void>}
 */
export const processSubCommandInit: ISubCommandProcessor<ISubCommandInitOptions> = async function (
  options: ISubCommandInitOptions,
): Promise<void> {
  try {
    const context: IGitCipherInitContext = await createGitCipherInitContextFromOptions(options)
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
export const mountSubCommandInit: ISubCommandMounter =
  createSubCommandMounter<ISubCommandInitOptions>(createSubCommandInit, processSubCommandInit)

/**
 * Execute sub-command: 'init'
 *
 * @param {Command}   parentCommand
 * @param {string[]}  args
 * @returns {Promise}
 */
export const execSubCommandInit: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandInitOptions>(createSubCommandInit, processSubCommandInit)
