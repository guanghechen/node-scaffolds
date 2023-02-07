import type { ICommandConfigurationFlatOpts } from '@guanghechen/helper-commander'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions } from '../option'

interface ISubCommandOptions extends IGlobalCommandOptions {
  /**
   * Root dir of decrypted outputs.
   * @default null
   */
  readonly outDir: string | null
  /**
   * If specified, then all of the files under the given commitId will be decrypted.
   * Otherwise, the entire repo will be generated.
   * @default null
   */
  readonly filesAt: string | null // <commit id | branch | null>
}

export type ISubCommandDecryptOptions = ISubCommandOptions & ICommandConfigurationFlatOpts

export const getDefaultCommandDecryptOptions = (): ISubCommandOptions => ({
  ...getDefaultGlobalCommandOptions(),
  outDir: null,
  filesAt: null,
})
