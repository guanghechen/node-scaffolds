import type { ILogger } from '@guanghechen/utility-types'
import type { Options as IExecaOptions } from 'execa'
import { safeExeca } from '../util'

export interface IGitCleanUntrackedOptions {
  cwd: string
  filepaths: string[]
  execaOptions?: IExecaOptions
  logger?: ILogger
}

export const cleanUntrackedFilepaths = async (
  options: IGitCleanUntrackedOptions,
): Promise<void> => {
  const cwd: string = options.cwd
  const env: NodeJS.ProcessEnv = { ...options.execaOptions?.env }
  const args: string[] = ['clean', '-df', ...options.filepaths]

  options?.logger?.debug(`[cleanUntrackedFilepaths] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd, env, extendEnv: true }
  await safeExeca('git', args, execaOptions)
}
