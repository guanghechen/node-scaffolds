import type { Options as IExecaOptions } from 'execa'
import type { IGitCommandBaseParams } from '../types'
import { safeExeca } from '../util'

export interface IHasUncommittedContentParams extends IGitCommandBaseParams {}

/**
 * Check if there are any uncommitted content.
 * @param params
 * @returns
 */
export const hasUncommittedContent = async (
  params: IHasUncommittedContentParams,
): Promise<boolean> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = ['status', '-s', '-uall']

  params?.logger?.debug(`[hasUnCommitContent] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  const result = await safeExeca('git', args, execaOptions)
  return Boolean(result.stdout.trim())
}
