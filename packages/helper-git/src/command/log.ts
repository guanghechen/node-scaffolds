import type { Options as IExecaOptions } from 'execa'
import type { IGitCommandBaseParams, IGitCommitDagNode, IGitCommitWithMessage } from '../types'
import { safeExeca } from '../util'

export interface IGetCommitInTopologyParams extends IGitCommandBaseParams {
  commitHash: string
}

export const getCommitInTopology = async (
  params: IGetCommitInTopologyParams,
): Promise<IGitCommitDagNode[]> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = [
    'log',
    params.commitHash,
    '--topo-order',
    '--date-order',
    '--reverse',
    '--pretty=format:"%H %P"',
  ]

  params?.reporter?.debug(`[getCommitInTopology] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  const result = await safeExeca('git', args, execaOptions, params.reporter)
  const commits: IGitCommitDagNode[] = result.stdout
    .trim()
    .split(/\n+/g)
    .map(line => {
      const [id, ...parents] = line.match(/[\da-f]+/gi) as string[]
      return { id, parents }
    })
  return commits
}

export interface IGetCommitWithMessageListParams extends IGitCommandBaseParams {
  commitHashes: string[]
}

export const getCommitWithMessageList = async (
  params: IGetCommitWithMessageListParams,
): Promise<IGitCommitWithMessage[]> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = ['log', ...params.commitHashes, `--pretty=format:"%H %B"`]

  params?.reporter?.debug(`[getCommitWithMessageList] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  const result = await safeExeca('git', args, execaOptions, params.reporter)

  const results: IGitCommitWithMessage[] = []
  {
    const text: string = result.stdout
    const lineSplitRegex = /"([\s\S]+?)\n\s*"(?:\n|$)/g
    const contentRegex = /^\s*([\da-f]+)\s+([\s\S]+?)$/
    for (;;) {
      const m = lineSplitRegex.exec(text)
      if (m === null) break
      const line: string = m[1].trim()
      const [, id, message] = line.match(contentRegex)!
      results.push({ id, message })
    }
  }
  return results
}

export interface IGetParentCommitIdListParams extends IGitCommandBaseParams {
  commitHash: string
}

export const getParentCommitIdList = async (
  params: IGetParentCommitIdListParams,
): Promise<string[]> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = ['log', params.commitHash, '-n 1', '--pretty=%P']

  params?.reporter?.debug(`[getParentCommitIdList] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  const result = await safeExeca('git', args, execaOptions, params.reporter)
  return result.stdout
    .split(/\s+/g)
    .map(x => x.trim())
    .filter(x => !!x)
}
