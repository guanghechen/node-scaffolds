import { safeExec } from '@guanghechen/exec'
import type { IReporter } from '@guanghechen/reporter.types'
import select from '@inquirer/select'
import commandExists from 'command-exists'

// Check if the git installed.
export const hasGitInstalled = (): boolean => commandExists.sync('git')

export interface IInstallDependenciesParams {
  readonly cwd: string
  readonly plopBypass: string[]
  readonly reporter?: IReporter
}

/**
 * Run `npm/yarn install` to Install node.js dependencies
 */
export async function installDependencies(params: IInstallDependenciesParams): Promise<void> {
  const { cwd, plopBypass, reporter } = params
  const hasYarnInstalled: boolean = commandExists.sync('yarn')

  /**
   * If neither yarn nor npm is installed, this operation will be skipped
   */
  if (!hasYarnInstalled) {
    const hasNpmInstalled: boolean = commandExists.sync('npm')
    if (!hasNpmInstalled) return
  }

  let npmScript: string
  if (plopBypass.length > 0) {
    npmScript = plopBypass.shift()!
  } else {
    npmScript = await select({
      message: 'npm or yarn?',
      choices: ['npm', 'yarn', 'skip'],
      default: hasYarnInstalled ? 'yarn' : 'npm',
    })
  }

  reporter?.debug?.('npmScript:', npmScript)

  // skip installing dependencies
  if (npmScript === 'skip') return

  // install dependencies
  await safeExec({ from: 'installDependencies', cmd: npmScript, args: ['install'], cwd, reporter })
}
