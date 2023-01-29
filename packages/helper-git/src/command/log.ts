import type { ILogger } from '@guanghechen/utility-types'
import type { Options as IExecaOptions } from 'execa'
import type { IGitCommitDagNode } from '../types'
import { safeExeca } from '../util'

export interface IGitGetCommitIdByMessageOptions {
  cwd: string
  messagePattern: string
  execaOptions?: IExecaOptions
  logger?: ILogger
}

/**
 * Get the commit ID by commit message.
 * @param options
 * @returns
 */
export const getCommitIdByMessage = async (
  options: IGitGetCommitIdByMessageOptions,
): Promise<string | never> => {
  const cwd: string = options.cwd
  const env: NodeJS.ProcessEnv = { ...options.execaOptions?.env }
  const args: string[] = ['rev-parse', `:/${options.messagePattern}`]

  options?.logger?.debug(`[getCommitIdByMessage] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd, env, extendEnv: true }
  const result = await safeExeca('git', args, execaOptions)
  return result.stdout.trim()
}

export interface IGetCommitInTopologyOptions {
  cwd: string
  commitId: string
  execaOptions?: IExecaOptions
  logger?: ILogger
}

export const getCommitInTopology = async (
  options: IGetCommitInTopologyOptions,
): Promise<IGitCommitDagNode[]> => {
  const cwd: string = options.cwd
  const env: NodeJS.ProcessEnv = { ...options.execaOptions?.env }
  const args: string[] = [
    'log',
    options.commitId,
    '--topo-order',
    '--date-order',
    '--reverse',
    '--pretty=format:"%H %P"',
  ]

  options?.logger?.debug(`[hasUnCommitContent] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd, env, extendEnv: true }
  const result = await safeExeca('git', args, execaOptions)
  const commits: IGitCommitDagNode[] = result.stdout
    .trim()
    .split(/\n+/g)
    .map(line => {
      const [id, ...parents] = line.match(/[\da-f]+/gi) as string[]
      return { id, parents }
    })
  return commits
}
