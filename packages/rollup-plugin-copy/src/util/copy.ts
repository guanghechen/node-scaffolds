// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import type { WriteFileOptions } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { ICopyTargetItem } from '../types'
import { relativePath } from './path'
import { reporter } from './reporter'

async function writeFile(
  filepath: string,
  content: string | NodeJS.ArrayBufferView,
  options?: WriteFileOptions,
): Promise<void> {
  const dirpath = path.dirname(filepath)
  await fs.mkdir(dirpath, { recursive: true })
  await fs.writeFile(filepath, content, options)
}

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

  reporter.verbose(() => {
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
