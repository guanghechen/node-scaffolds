import type { ILogger } from '@guanghechen/utility-types'
import dayjs from 'dayjs'
import type { Options as IExecaOptions } from 'execa'
import type { IGitCommitInfo } from '../types'
import { safeExeca } from '../util'

export interface IMergeCommitsOptions extends Partial<Omit<IGitCommitInfo, 'commitId'>> {
  cwd: string
  message: string
  parentIds: string[]
  execaOptions?: IExecaOptions
  logger?: ILogger
}

export const mergeCommits = async (options: IMergeCommitsOptions): Promise<void> => {
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
