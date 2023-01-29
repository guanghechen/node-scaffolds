import type { ILogger } from '@guanghechen/utility-types'
import type { Options as IExecaOptions } from 'execa'
import { execa } from 'execa'

export interface IInitGitRepoOptions {
  cwd: string
  defaultBranch?: string
  authorName?: string
  authorEmail?: string
  execaOptions?: IExecaOptions
  logger?: ILogger
}

export const initGitRepo = async (options: IInitGitRepoOptions): Promise<void> => {
  options?.logger?.debug(`[initGitRepo] cwd: {}`, options.cwd)

  // create init commit
  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd: options.cwd }
  await execa('git', ['init'], execaOptions)
  await execa('git', ['branch', '-m', options.defaultBranch ?? 'main'], execaOptions)
  await execa('git', ['config', 'commit.gpgSign', 'false'], execaOptions)

  if (options.authorName) {
    await execa('git', ['config', 'user.name', options.authorName], execaOptions)
  }

  if (options.authorEmail) {
    await execa('git', ['config', 'user.email', options.authorEmail], execaOptions)
  }
}
