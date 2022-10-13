import type { ICommandConfigurationFlatOpts } from '@guanghechen/helper-commander'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions } from '../option'

type ISubCommandOptions = IGlobalCommandOptions

export type ISubCommandInitOptions = ISubCommandOptions & ICommandConfigurationFlatOpts

export const getDefaultCommandOptions = (): ISubCommandOptions => ({
  ...getDefaultGlobalCommandOptions(),
})
