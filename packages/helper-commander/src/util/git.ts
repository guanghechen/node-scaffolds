import type { IInitGitRepoParams } from '@guanghechen/helper-git'
import { commitAll, initGitRepo } from '@guanghechen/helper-git'
import { toLowerCase } from '@guanghechen/helper-string'
import commandExists from 'command-exists'

// Check if the git installed.
export const hasGitInstalled = (): boolean => commandExists.sync('git')

export interface ICreateInitGitRepoParams extends IInitGitRepoParams {
  plopBypass: string[]
}

// Create initial commit
export async function createInitialCommit(params: ICreateInitGitRepoParams): Promise<void> {
  // If git is not installed yet, this operation will be skipped
  if (!hasGitInstalled()) return

  const { plopBypass, cwd, reporter, ...initGitRepoParams } = params
  let doInitialCommit: boolean
  if (plopBypass.length > 0) {
    const booleanString = toLowerCase(plopBypass.shift()!)
    doInitialCommit = booleanString === 'true' || booleanString === 'yes' || booleanString === 'y'
  } else {
    const inquirer = await import('inquirer').then(md => md.default)
    doInitialCommit = (
      await inquirer.prompt([
        {
          type: 'confirm',
          name: 'doInitialCommit',
          default: false,
          message: 'Create initial commit?',
        },
      ])
    ).doInitialCommit
  }

  reporter?.debug?.('doInitialCommit:', doInitialCommit)

  // skip
  if (!doInitialCommit) return

  // create init commit
  await initGitRepo({ cwd, reporter, ...initGitRepoParams })
  await commitAll({ cwd, reporter, message: ':tada:  initialize.', amend: false })
}
