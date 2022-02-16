import chalk from 'chalk'
import fs from 'fs-extra'
import type { ICopyTargetItem } from '../types'
import { logger } from './logger'

export async function copySingleItem(item: ICopyTargetItem): Promise<void> {
  const { contents, destPath, srcPath, transformed, target } = item

  if (transformed) {
    await fs.outputFile(destPath, contents, target.fsExtraOptions.outputFile)
  } else {
    await fs.copy(srcPath, destPath, target.fsExtraOptions.copy)
  }

  logger.verbose(() => {
    const flagKeys: ReadonlyArray<keyof ICopyTargetItem> = ['renamed', 'transformed']

    const flags: string[] = flagKeys
      .filter(key => item[key])
      .map(key => key.charAt(0).toUpperCase())

    let message = chalk.green(`  ${chalk.bold(srcPath)} → ${chalk.bold(destPath)}`)
    if (flags.length) message = `${message} ${chalk.yellow(`[${flags.join(', ')}]`)}`
    return message
  }, target.verbose)
}
