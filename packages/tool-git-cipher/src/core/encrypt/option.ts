import type { ICommandConfigurationFlatOpts } from '@guanghechen/helper-commander'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions, resolveBaseCommandOptions } from '../option'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ISubCommandOptions {}

type ICommandOptions = IGlobalCommandOptions & ISubCommandOptions
export type ISubCommandEncryptOptions = ICommandOptions & ICommandConfigurationFlatOpts

const getDefaultCommandEncryptOptions = (): ICommandOptions => ({
  ...getDefaultGlobalCommandOptions(),
})

export function resolveSubCommandEncryptOptions(
  commandName: string,
  subCommandName: string,
  workspaceDir: string,
  options: ISubCommandEncryptOptions,
): ISubCommandEncryptOptions {
  const baseOptions: ISubCommandEncryptOptions = resolveBaseCommandOptions<ICommandOptions>(
    commandName,
    subCommandName,
    getDefaultCommandEncryptOptions(),
    workspaceDir,
    options,
  )

  const resolvedOptions: ISubCommandOptions = {}
  return { ...baseOptions, ...resolvedOptions }
}
