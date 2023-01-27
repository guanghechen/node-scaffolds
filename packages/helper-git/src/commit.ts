import type { Options as IExecaOptions } from 'execa'
import { execa } from 'execa'
import { commitStaged, stageAll } from './atomic'
import type { IGitCommitOptions, IGitInitOptions, IGitStageOptions } from './types'

export const initGitRepo = async (options: IGitInitOptions): Promise<void> => {
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

export const commitAll = async (options: IGitCommitOptions & IGitStageOptions): Promise<void> => {
  await stageAll(options)
  await commitStaged(options)
}
