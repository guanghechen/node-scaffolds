import type { Options as IExecaOptions } from 'execa'
import { execa } from 'execa'
import type { IGitCommandBaseParams } from '../types'

export interface IInitGitRepoParams extends IGitCommandBaseParams {
  defaultBranch?: string
  authorName?: string
  authorEmail?: string
  gpgSign?: boolean
  eol?: 'lf'
  encoding?: BufferEncoding
}

export const initGitRepo = async (params: IInitGitRepoParams): Promise<void> => {
  params?.logger?.debug(`[initGitRepo] cwd: {}`, params.cwd)
  const { gpgSign = false, defaultBranch = 'main', eol = 'lf', encoding = 'utf-8' } = params

  // create init commit
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd: params.cwd }
  await execa('git', ['init', '--initial-branch', defaultBranch], execaOptions)
  await execa('git', ['config', 'commit.gpgSign', gpgSign ? 'true' : 'false'], execaOptions)
  await execa('git', ['config', 'core.eol', eol], execaOptions)
  await execa('git', ['config', 'i18n.commitEncoding', encoding], execaOptions)
  await execa('git', ['config', 'i18n.logOutputEncoding', encoding], execaOptions)

  if (params.authorName) {
    await execa('git', ['config', 'user.name', params.authorName], execaOptions)
  }

  if (params.authorEmail) {
    await execa('git', ['config', 'user.email', params.authorEmail], execaOptions)
  }
}
