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

  params?.logger?.debug(`[hasUnCommitContent] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  const result = await safeExeca('git', args, execaOptions, params.logger)
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
  branchOrCommitIds: string[]
}

export const getCommitWithMessageList = async (
  params: IGetCommitWithMessageListParams,
): Promise<IGitCommitWithMessage[]> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = ['log', ...params.branchOrCommitIds, `--pretty=format:"%H %B"`]

  params?.logger?.debug(`[getCommitIdByMessage] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  const result = await safeExeca('git', args, execaOptions, params.logger)

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
