import chalk from 'chalk'
import fs from 'fs-extra'
import type { ICopyTargetItem } from '../types'
import { logger } from './logger'

const copyingQueue: Array<{ timestamp: number; item: ICopyTargetItem }> = []

export async function copySingleItem(item: ICopyTargetItem): Promise<void> {
  if (item.copying) {
    const timestamp: number = Date.now()
    // eslint-disable-next-line no-param-reassign
    item.queueingTimestamp = timestamp
    copyingQueue.push({ timestamp, item })
    return
  }

  const { destPath, srcPath, target } = item

  if (target.transform) {
    const rawContents = await fs.readFile(srcPath)
    const contents = await target.transform(rawContents, srcPath, destPath)
    await fs.outputFile(destPath, contents, target.fsExtraOptions.outputFile)
  } else {
    await fs.copy(srcPath, destPath, target.fsExtraOptions.copy)
  }

  logger.verbose(() => {
    const flags: string[] = []
    if (item.renamed) flags.push('R')
    if (item.target.transform) flags.push('T')

    let message = chalk.green(`  ${chalk.bold(srcPath)} → ${chalk.bold(destPath)}`)
    if (flags.length) message = `${message} ${chalk.yellow(`[${flags.join(', ')}]`)}`
    return message
  }, target.verbose)

  const nextItem = copyingQueue.shift()
  if (nextItem && nextItem.timestamp === nextItem.item.queueingTimestamp) {
    await copySingleItem(nextItem.item)
  }
}
