import dayjs from 'dayjs'
import type { Options as IExecaOptions } from 'execa'
import type {
  ICommitViewOptions,
  IGitCheckOptions,
  IGitCommitDagNode,
  IGitCommitOptions,
  IGitMergeOptions,
  IGitStageOptions,
} from './types'
import { safeExeca } from './util'

/**
 * Check to a branch or commit.
 * @param options
 */
export const checkBranch = async (options: IGitCheckOptions): Promise<void> => {
  const cwd: string = options.cwd
  const env: NodeJS.ProcessEnv = { ...options.execaOptions?.env }
  const args: string[] = ['checkout', options.commitId]

  options?.logger?.debug(`[checkBranch] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd, env, extendEnv: true }
  await safeExeca('git', args, execaOptions)
}

/**
 * Check if there are any uncommitted content.
 * @param options
 * @returns
 */
export const hasUncommittedContent = async (
  options: Omit<ICommitViewOptions, 'commitId'>,
): Promise<boolean> => {
  const cwd: string = options.cwd
  const env: NodeJS.ProcessEnv = { ...options.execaOptions?.env }
  const args: string[] = ['status', '-s', '-uall']

  options?.logger?.debug(`[hasUnCommitContent] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd, env, extendEnv: true }
  const result = await safeExeca('git', args, execaOptions)
  return Boolean(result.stdout.trim())
}

/**
 * Stage all uncommitted files.
 * @param options
 */
export const stageAll = async (options: IGitStageOptions): Promise<void> => {
  const cwd: string = options.cwd
  const env: NodeJS.ProcessEnv = { ...options.execaOptions?.env }
  const args: string[] = ['add', '-A']

  options?.logger?.debug(`[stageAll] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd, env, extendEnv: true }
  await safeExeca('git', args, execaOptions)
}

export const commitStaged = async (options: IGitCommitOptions): Promise<void> => {
  const cwd: string = options.cwd
  const env: NodeJS.ProcessEnv = { ...options.execaOptions?.env }
  const args: string[] = ['commit', '-m', options.message]

  if (options.authorDate) {
    const date = dayjs(options.authorDate).format('ddd MMM DD HH:mm:ss YYYY ZZ')
    env.GIT_AUTHOR_DATE = date
    env.GIT_COMMITTER_DATE = date
  }
  if (options.authorName) {
    env.GIT_AUTHOR_NAME = options.authorName
    env.GIT_COMMITTER_NAME = options.authorName
  }
  if (options.authorEmail) {
    env.GIT_AUTHOR_EMAIL = options.authorEmail
    env.GIT_COMMITTER_EMAIL = options.authorEmail
  }
  if (options.committerDate) {
    env.GIT_COMMITTER_DATE = dayjs(options.committerDate).format('ddd MMM DD HH:mm:ss YYYY ZZ')
  }
  if (options.committerName) env.GIT_COMMITTER_NAME = options.committerName
  if (options.committerEmail) env.GIT_COMMITTER_EMAIL = options.committerEmail

  options?.logger?.debug(`[commitStaged] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd, env, extendEnv: true }
  await safeExeca('git', args, execaOptions)
}

export const mergeCommits = async (options: IGitMergeOptions): Promise<void> => {
  const cwd: string = options.cwd
  const env: NodeJS.ProcessEnv = { ...options.execaOptions?.env }
  const args: string[] = ['merge', ...options.parentIds, '-m', options.message]

  if (options.authorDate) {
    const date = dayjs(options.authorDate).format('ddd MMM DD HH:mm:ss YYYY ZZ')
    env.GIT_AUTHOR_DATE = date
    env.GIT_COMMITTER_DATE = date
  }
  if (options.authorName) {
    env.GIT_AUTHOR_NAME = options.authorName
    env.GIT_COMMITTER_NAME = options.authorName
  }
  if (options.authorEmail) {
    env.GIT_AUTHOR_EMAIL = options.authorEmail
    env.GIT_COMMITTER_EMAIL = options.authorEmail
  }
  if (options.committerDate) {
    env.GIT_COMMITTER_DATE = dayjs(options.committerDate).format('ddd MMM DD HH:mm:ss YYYY ZZ')
  }
  if (options.committerName) env.GIT_COMMITTER_NAME = options.committerName
  if (options.committerEmail) env.GIT_COMMITTER_EMAIL = options.committerEmail

  options?.logger?.debug(`[checkBranch] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd, env, extendEnv: true }
  await safeExeca('git', args, execaOptions)
}

export const getCommitInTopology = async (
  options: ICommitViewOptions,
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
