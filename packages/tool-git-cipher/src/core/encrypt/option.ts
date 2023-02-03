import type { ICommandConfigurationFlatOpts } from '@guanghechen/helper-commander'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions } from '../option'

interface ISubCommandOptions extends IGlobalCommandOptions {}

export type ISubCommandEncryptOptions = ISubCommandOptions & ICommandConfigurationFlatOpts

export const getDefaultCommandEncryptOptions = (): ISubCommandOptions => ({
  ...getDefaultGlobalCommandOptions(),
})
