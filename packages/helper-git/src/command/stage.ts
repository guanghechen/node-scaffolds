import type { ILogger } from '@guanghechen/utility-types'
import type { Options as IExecaOptions } from 'execa'
import { safeExeca } from '../util'

export interface IStageAllOptions {
  cwd: string
  execaOptions?: IExecaOptions
  logger?: ILogger
}

/**
 * Stage all uncommitted files.
 * @param options
 */
export const stageAll = async (options: IStageAllOptions): Promise<void> => {
  const cwd: string = options.cwd
  const env: NodeJS.ProcessEnv = { ...options.execaOptions?.env }
  const args: string[] = ['add', '-A']

  options?.logger?.debug(`[stageAll] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd, env, extendEnv: true }
  await safeExeca('git', args, execaOptions)
}
