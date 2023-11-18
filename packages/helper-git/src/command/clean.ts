import type { Options as IExecaOptions } from 'execa'
import type { IGitCommandBaseParams } from '../types'
import { safeExeca } from '../util'

export interface IGitCleanUntrackedParams extends IGitCommandBaseParams {
  filepaths: string[]
}

export const cleanUntrackedFilepaths = async (params: IGitCleanUntrackedParams): Promise<void> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = ['clean', '-df', ...params.filepaths]

  params?.reporter?.debug(`[cleanUntrackedFilepaths] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  await safeExeca('git', args, execaOptions, params.reporter)
}
