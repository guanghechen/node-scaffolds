import type { ILogger } from '@guanghechen/utility-types'
import type { Options as IExecaOptions } from 'execa'
import { safeExeca } from '../util'

export interface IHasUncommittedContentOptions {
  cwd: string
  execaOptions?: IExecaOptions
  logger?: ILogger
}

/**
 * Check if there are any uncommitted content.
 * @param options
 * @returns
 */
export const hasUncommittedContent = async (
  options: IHasUncommittedContentOptions,
): Promise<boolean> => {
  const cwd: string = options.cwd
  const env: NodeJS.ProcessEnv = { ...options.execaOptions?.env }
  const args: string[] = ['status', '-s', '-uall']

  options?.logger?.debug(`[hasUnCommitContent] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd, env, extendEnv: true }
  const result = await safeExeca('git', args, execaOptions)
  return Boolean(result.stdout.trim())
}
