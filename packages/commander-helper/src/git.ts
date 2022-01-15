import type { ChalkLogger } from '@guanghechen/chalk-logger'
import commandExists from 'command-exists'
import execa from 'execa'
import inquirer from 'inquirer'

/**
 * Create a git commit with all file changes
 *
 * @param execaOptions
 * @param message
 */
export async function createCommitAll(execaOptions: execa.Options, message: string): Promise<void> {
  await execa('git', ['add', '-A'], execaOptions)
  await execa('git', ['commit', '-m', message], execaOptions)
}

/**
 * Create initial commit
 * @param execaOptions
 * @param plopBypass
 * @param logger
 */
export async function createInitialCommit(
  execaOptions: execa.Options,
  plopBypass: string[],
  logger?: ChalkLogger,
): Promise<void> {
  /**
   * If git is not installed yet, this operation will be skipped
   */
  const hasGitInstalled: boolean = commandExists.sync('git')
  if (!hasGitInstalled) {
    return
  }

  let doInitialCommit: boolean
  if (plopBypass.length > 0) {
    const booleanString = plopBypass.shift()!.toLowerCase()
    doInitialCommit = booleanString === 'true' || booleanString === 'yes' || booleanString === 'y'
  } else {
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

  if (logger != null && logger.debug != null) {
    logger.debug('doInitialCommit:', doInitialCommit)
  }

  // skip
  if (!doInitialCommit) return

  // create init commit
  await execa('git', ['init'], execaOptions)
  await createCommitAll(execaOptions, ':tada:  initialize.')
}
