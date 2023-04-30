import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { handleError } from '../../util/events'
import { createGitCipherVerifyContextFromOptions } from './context'
import type { IGitCipherVerifyContext } from './context'
import type { ISubCommandVerifyOptions } from './option'
import { GitCipherVerifyProcessor } from './processor'

// Process sub-command: verify
export const verify: ISubCommandProcessor<ISubCommandVerifyOptions> = async (
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
