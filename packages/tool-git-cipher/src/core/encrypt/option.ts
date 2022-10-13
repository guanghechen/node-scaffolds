import type { ICommandConfigurationFlatOpts } from '@guanghechen/helper-commander'
import type { IGlobalCommandOptions } from '../option'
import { getDefaultGlobalCommandOptions } from '../option'

interface ISubCommandOptions extends IGlobalCommandOptions {
  /**
   * Whether to update in full, if not, only update files whose mtime is less
   * than the mtime recorded in the index file
   */
  readonly full: boolean
  /**
   * Perform `git fetch --all` before encrypt
   */
  readonly updateBeforeEncrypt: boolean
  /**
   * List of directories to encrypt
   * @default ['.git']
   */
  readonly sensitiveDirectories: string[]
}

export type ISubCommandEncryptOptions = ISubCommandOptions & ICommandConfigurationFlatOpts

export const getDefaultCommandEncryptOptions = (): ISubCommandOptions => ({
  ...getDefaultGlobalCommandOptions(),
  full: false,
  updateBeforeEncrypt: false,
  sensitiveDirectories: ['.git'],
})
