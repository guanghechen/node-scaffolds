import type { Options as IExecaOptions } from 'execa'
import type { IGitCommandBaseParams } from '../types'
import { safeExeca } from '../util'

export interface ICheckBranchParams extends IGitCommandBaseParams {
  commitHash: string
}

/**
 * Check to a branch or commit.
 * @param params
 */
export const checkBranch = async (params: ICheckBranchParams): Promise<void> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = ['checkout', params.commitHash]

  params?.reporter?.debug(`[checkBranch] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  await safeExeca('git', args, execaOptions, params.reporter)
}

export interface ICreateBranchParams extends IGitCommandBaseParams {
  newBranchName: string
  commitHash: string
}

export const createBranch = async (params: ICreateBranchParams): Promise<void> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = ['branch', params.newBranchName, params.commitHash]

  params?.reporter?.debug(`[createBranch] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  await safeExeca('git', args, execaOptions, params.reporter)
}

export interface IDeleteBranchParams extends IGitCommandBaseParams {
  branchName: string
  force: boolean
}

export const deleteBranch = async (params: IDeleteBranchParams): Promise<void> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = ['branch', params.force ? '-D' : '-d', params.branchName]

  params?.reporter?.debug(`[deleteBranch] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  await safeExeca('git', args, execaOptions, params.reporter)
}

export interface IGetAllLocalBranchParams extends IGitCommandBaseParams {}

/**
 * Get all local branches and current branch. If current commit is not a named branch, then the
 * currentBranch will be set to null.
 * @param params
 * @returns
 */
export const getAllLocalBranches = async (
  params: IGetAllLocalBranchParams,
): Promise<{
  currentBranch: string | null
  branches: string[]
}> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = ['branch']

  params?.reporter?.debug(`[getAllLocalBranches] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  const result = await safeExeca('git', args, execaOptions, params.reporter)

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

  return { currentBranch, branches: branches.sort() }
}
