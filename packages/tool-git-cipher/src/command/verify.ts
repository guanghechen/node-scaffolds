import { createSubCommandExecutor, createSubCommandMounter } from '@guanghechen/helper-commander'
import type {
  ISubCommandExecutor,
  ISubCommandMounter,
  ISubCommandProcessor,
} from '@guanghechen/helper-commander'
import { createSubCommandVerify } from '../core/verify/command'
import { createGitCipherVerifyContextFromOptions } from '../core/verify/context'
import type { IGitCipherVerifyContext } from '../core/verify/context'
import type { ISubCommandVerifyOptions } from '../core/verify/option'
import { GitCipherVerifyProcessor } from '../core/verify/processor'
import { handleError } from '../util/events'

// Process sub-command: verify
export const processSubCommandVerify: ISubCommandProcessor<ISubCommandVerifyOptions> = async (
  options: ISubCommandVerifyOptions,
): Promise<void> => {
  try {
    const context: IGitCipherVerifyContext = await createGitCipherVerifyContextFromOptions(options)
    const processor = new GitCipherVerifyProcessor(context)
    await processor.verify()
  } catch (error) {
    handleError(error)
  }
}

// Mount Sub-command: verify
export const mountSubCommandVerify: ISubCommandMounter =
  createSubCommandMounter<ISubCommandVerifyOptions>(createSubCommandVerify, processSubCommandVerify)

// Execute sub-command: verify
export const execSubCommandVerify: ISubCommandExecutor =
  createSubCommandExecutor<ISubCommandVerifyOptions>(
    createSubCommandVerify,
    processSubCommandVerify,
  )
