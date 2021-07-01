import type { ChalkLogger } from '@guanghechen/chalk-logger'
import { toLowerCase } from '@guanghechen/option-helper'
import commandExists from 'command-exists'
import execa from 'execa'
import inquirer from 'inquirer'

/**
 * Run `npm/yarn install` to Install node.js dependencies
 * @param execaOptions
 * @param plopBypass
 * @param logger
 */
export async function installDependencies(
  execaOptions: execa.Options,
  plopBypass: string[],
  logger?: ChalkLogger,
): Promise<void> {
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
    npmScript = (
      await inquirer.prompt([
        {
          type: 'list',
          name: 'npmScript',
          default: hasYarnInstalled ? 'yarn' : 'npm',
          message: 'npm or yarn?',
          choices: ['npm', 'yarn', 'skip'],
          filter: x => toLowerCase(x).trim(),
          transformer: (x: string) => toLowerCase(x).trim(),
        },
      ])
    ).npmScript
  }

  if (logger != null && logger.debug != null) {
    logger.debug('npmScript:', npmScript)
  }

  // skip installing dependencies
  if (npmScript === 'skip') return

  // install dependencies
  await execa(npmScript, ['install'], execaOptions)
}
