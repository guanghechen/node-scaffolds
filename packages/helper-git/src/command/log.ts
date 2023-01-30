import type { Options as IExecaOptions } from 'execa'
import type { IGitCommandBaseParams, IGitCommitDagNode, IGitCommitWithMessage } from '../types'
import { safeExeca } from '../util'

export interface IGitGetCommitIdByMessageParams extends IGitCommandBaseParams {
  messagePattern: string
}

/**
 * Get the commit ID by commit message.
 * @param params
 * @returns
 */
export const getCommitIdByMessage = async (
  params: IGitGetCommitIdByMessageParams,
): Promise<string | never> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = ['rev-parse', `:/${params.messagePattern}`]

  params?.logger?.debug(`[getCommitIdByMessage] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  const result = await safeExeca('git', args, execaOptions)
  return result.stdout.trim()
}

export interface IGetCommitInTopologyParams extends IGitCommandBaseParams {
  branchOrCommitId: string
}

export const getCommitInTopology = async (
  params: IGetCommitInTopologyParams,
): Promise<IGitCommitDagNode[]> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = [
    'log',
    params.branchOrCommitId,
    '--topo-order',
    '--date-order',
    '--reverse',
    '--pretty=format:"%H %P"',
  ]

  params?.logger?.debug(`[hasUnCommitContent] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
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

export interface IGetCommitWithMessageListParams extends IGitCommandBaseParams {
  branches: string[]
}

export const getCommitWithMessageList = async (
  params: IGetCommitWithMessageListParams,
): Promise<IGitCommitWithMessage[]> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = ['log', ...params.branches, `--pretty=format:"%H %B"`]

  params?.logger?.debug(`[getCommitIdByMessage] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  const result = await safeExeca('git', args, execaOptions)

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
