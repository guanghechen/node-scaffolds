import type { ICommandConfigurationFlatOpts } from '@guanghechen/helper-commander'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions } from '../option'

interface ISubCommandOptions extends IGlobalCommandOptions {
  /**
   * root dir of outputs
   * @default null
   */
  readonly outDir: string | null
}

export type ISubCommandDecryptOptions = ISubCommandOptions & ICommandConfigurationFlatOpts

export const getDefaultCommandDecryptOptions = (): ISubCommandOptions => ({
  ...getDefaultGlobalCommandOptions(),
  outDir: null,
})
