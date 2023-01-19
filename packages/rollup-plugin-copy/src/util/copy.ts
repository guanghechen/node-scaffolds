import { writeFile } from '@guanghechen/helper-fs'
import chalk from 'chalk'
import fs from 'node:fs/promises'
import type { ICopyTargetItem } from '../types'
import { logger } from './logger'
import { relativePath } from './path'

export async function copySingleItem(workspace: string, item: ICopyTargetItem): Promise<void> {
  if (item.copying) {
    enqueue(item)
    return
  }

  const { destPath, srcPath, target } = item

  if (target.transform) {
    try {
      const rawContents = await fs.readFile(srcPath)
      const contents = await target.transform(rawContents, srcPath, destPath)
      await writeFile(destPath, contents, target.fsOptions.writeFile)
    } catch (error) {
      console.error(error)
      enqueue(item)
      await consume(workspace)
      return
    }
  } else {
    await fs.cp(srcPath, destPath, {
      recursive: true,
      ...target.fsOptions.copy,
    })
  }

  logger.verbose(() => {
    const flags: string[] = []
    if (item.renamed) flags.push('R')
    if (item.target.transform) flags.push('T')

    let message = chalk.green(
      `  ${chalk.bold(relativePath(workspace, srcPath))} → ${chalk.bold(
        relativePath(workspace, destPath),
      )}`,
    )
    if (flags.length) message = `${message} ${chalk.yellow(`[${flags.join(', ')}]`)}`
    return message
  }, target.verbose)

  await consume(workspace)
}

const copyingQueue: Array<{ timestamp: number; item: ICopyTargetItem }> = []
function enqueue(item: ICopyTargetItem): void {
  const timestamp: number = Date.now()
  // eslint-disable-next-line no-param-reassign
  item.queueingTimestamp = timestamp
  copyingQueue.push({ timestamp, item })
}

async function consume(workspace: string): Promise<void> {
  const nextItem = copyingQueue.shift()
  if (nextItem && nextItem.timestamp === nextItem.item.queueingTimestamp) {
    await copySingleItem(workspace, nextItem.item)
  }
}
