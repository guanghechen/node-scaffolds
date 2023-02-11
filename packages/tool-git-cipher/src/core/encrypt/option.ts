import type { ICommandConfigurationFlatOpts } from '@guanghechen/helper-commander'
import { PACKAGE_NAME } from '../../env/constant'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveGlobalCommandOptions } from '../option'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISubCommandOptions {}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandEncryptOptions = ICommandOptions & ICommandConfigurationFlatOpts

export const getDefaultCommandEncryptOptions = (): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(),
})

export function resolveSubCommandEncryptOptions(
  commandName: string,
  workspaceDir: string,
  options: ISubCommandEncryptOptions,
): ISubCommandEncryptOptions {
  const defaultOptions: ICommandOptions = getDefaultCommandEncryptOptions()

  type R = IGlobalCommandOptions & ICommandConfigurationFlatOpts
  const globalOptions: R = resolveGlobalCommandOptions(
    PACKAGE_NAME,
    commandName,
    defaultOptions,
    workspaceDir,
    options,
  )

  const resolvedOptions: ISubCommandOptions = {}
  return { ...globalOptions, ...resolvedOptions }
}
