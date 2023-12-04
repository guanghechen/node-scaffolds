import type { Options as IExecaOptions } from 'execa'
import type { IGitCommandBaseParams } from '../types'
import { safeExeca } from '../util'

export interface IInitGitRepoParams extends IGitCommandBaseParams {
  defaultBranch?: string
  authorName?: string
  authorEmail?: string
  gpgSign?: boolean
  logDate?: 'relative' | 'local' | 'default' | 'iso' | 'rfc' | 'short' | 'raw'
  eol?: 'lf'
  encoding?: BufferEncoding
}

export const initGitRepo = async (params: IInitGitRepoParams): Promise<void> => {
  const { reporter } = params
  reporter?.debug(`[initGitRepo] cwd: {}`, params.cwd)
  const {
    gpgSign,
    logDate = 'iso',
    defaultBranch = 'main',
    eol = 'lf',
    encoding = 'utf-8',
  } = params

  // create init commit
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd: params.cwd }
  await safeExeca('git', ['init', '--initial-branch', defaultBranch], execaOptions, reporter)
  if (gpgSign !== undefined) {
    await safeExeca(
      'git',
      ['config', 'commit.gpgSign', gpgSign ? 'true' : 'false'],
      execaOptions,
      reporter,
    )
  }
  await safeExeca('git', ['config', 'log.date', logDate], execaOptions, reporter)
  await safeExeca('git', ['config', 'core.eol', eol], execaOptions, reporter)
  await safeExeca('git', ['config', 'i18n.commitEncoding', encoding], execaOptions, reporter)
  await safeExeca('git', ['config', 'i18n.logOutputEncoding', encoding], execaOptions, reporter)

  if (params.authorName) {
    await safeExeca('git', ['config', 'user.name', params.authorName], execaOptions, reporter)
  }

  if (params.authorEmail) {
    await safeExeca('git', ['config', 'user.email', params.authorEmail], execaOptions, reporter)
  }
}
