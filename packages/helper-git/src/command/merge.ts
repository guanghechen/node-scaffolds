import dayjs from 'dayjs'
import type { Options as IExecaOptions } from 'execa'
import type { IGitCommandBaseParams, IGitCommitInfo } from '../types'
import { safeExeca } from '../util'

export interface IMergeCommitsParams
  extends IGitCommandBaseParams,
    Partial<Omit<IGitCommitInfo, 'commitId'>> {
  message: string
  parentIds: string[]
}

export const mergeCommits = async (params: IMergeCommitsParams): Promise<void> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = ['merge', ...params.parentIds, '-m', params.message]

  if (params.authorDate) {
    const date = dayjs(params.authorDate).format('ddd MMM DD HH:mm:ss YYYY ZZ')
    env.GIT_AUTHOR_DATE = date
    env.GIT_COMMITTER_DATE = date
  }
  if (params.authorName) {
    env.GIT_AUTHOR_NAME = params.authorName
    env.GIT_COMMITTER_NAME = params.authorName
  }
  if (params.authorEmail) {
    env.GIT_AUTHOR_EMAIL = params.authorEmail
    env.GIT_COMMITTER_EMAIL = params.authorEmail
  }
  if (params.committerDate) {
    env.GIT_COMMITTER_DATE = dayjs(params.committerDate).format('ddd MMM DD HH:mm:ss YYYY ZZ')
  }
  if (params.committerName) env.GIT_COMMITTER_NAME = params.committerName
  if (params.committerEmail) env.GIT_COMMITTER_EMAIL = params.committerEmail

  params?.logger?.debug(`[checkBranch] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  await safeExeca('git', args, execaOptions)
}
