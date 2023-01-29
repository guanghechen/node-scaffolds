import type { ILogger } from '@guanghechen/utility-types'
import type { Options as IExecaOptions } from 'execa'
import { safeExeca } from '../util'

export interface ICheckBranchOptions {
  cwd: string
  commitId: string
  execaOptions?: IExecaOptions
  logger?: ILogger
}

/**
 * Check to a branch or commit.
 * @param options
 */
export const checkBranch = async (options: ICheckBranchOptions): Promise<void> => {
  const cwd: string = options.cwd
  const env: NodeJS.ProcessEnv = { ...options.execaOptions?.env }
  const args: string[] = ['checkout', options.commitId]

  options?.logger?.debug(`[checkBranch] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd, env, extendEnv: true }
  await safeExeca('git', args, execaOptions)
}

export interface IGetAllLocalBranchOptions {
  cwd: string
  execaOptions?: IExecaOptions
  logger?: ILogger
}

/**
 * Get all local branches and current branch. If current commit is not a named branch, then the
 * currentBranch will be set to null.
 * @param options
 * @returns
 */
export const getAllLocalBranches = async (
  options: IGetAllLocalBranchOptions,
): Promise<{
  currentBranch: string | null
  branches: string[]
}> => {
  const cwd: string = options.cwd
  const env: NodeJS.ProcessEnv = { ...options.execaOptions?.env }
  const args: string[] = ['branch']

  options?.logger?.debug(`[getAllLocalBranches] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd, env, extendEnv: true }
  const result = await safeExeca('git', args, execaOptions)

  let currentBranch: string | null = null
  const branches: string[] = []
  result.stdout.split(/\n/g).forEach(line => {
    let branch: string | null = line.trim()
    if (branch.startsWith('*')) {
      branch = branch.substring(2).trim()
      if (branch.startsWith('(')) branch = null
      else currentBranch = branch
    }
    if (branch !== null) branches.push(branch)
  })

  return { currentBranch, branches }
}
