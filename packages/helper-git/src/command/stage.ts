import type { Options as IExecaOptions } from 'execa'
import type { IGitCommandBaseParams } from '../types'
import { safeExeca } from '../util'

export interface IStageAllParams extends IGitCommandBaseParams {}

/**
 * Stage all uncommitted files.
 * @param params
 */
export const stageAll = async (params: IStageAllParams): Promise<void> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = ['add', '-A']

  params?.reporter?.debug(`[stageAll] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  await safeExeca('git', args, execaOptions, params.reporter)
}
