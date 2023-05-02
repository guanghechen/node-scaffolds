import type { ISubCommandProcessor } from '@guanghechen/helper-commander'
import { createVerifyContextFromOptions } from './context'
import type { IGitCipherVerifyContext } from './context'
import type { ISubCommandVerifyOptions } from './option'
import { GitCipherVerifyProcessor } from './processor'

// Process sub-command: verify
export const verify: ISubCommandProcessor<ISubCommandVerifyOptions> = async (
  options: ISubCommandVerifyOptions,
): Promise<void> => {
  const context: IGitCipherVerifyContext = await createVerifyContextFromOptions(options)
  const processor = new GitCipherVerifyProcessor(context)
  await processor.verify()
}
