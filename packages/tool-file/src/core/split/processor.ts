import {
  FileSplitter,
  calcFilePartItemsByCount,
  calcFilePartItemsBySize,
} from '@guanghechen/file-split'
import type { IFilePartItem } from '@guanghechen/file-split'
import { isFileSync } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import { pathResolver } from '@guanghechen/path'
import fs from 'node:fs/promises'
import { logger } from '../../env/logger'
import type { IFileSplitContext } from './context'

export class FileSplitProcessor {
  protected readonly context: IFileSplitContext

  constructor(context: IFileSplitContext) {
    logger.debug('context:', context)

    this.context = context
  }

  public async split([filepath]: string[]): Promise<void> {
    const title = 'processor.split'
    const { workspace, partCodePrefix, partSize = 0, partTotal = 1, output } = this.context

    logger.debug('args: filepath:', filepath)

    const absoluteFilepath = pathResolver.safeResolve(workspace, filepath)
    invariant(isFileSync(absoluteFilepath), `[${title}] Cannot find ${absoluteFilepath}.`)

    const fileSize: number = await fs.stat(absoluteFilepath).then(file => file.size)
    const fileParts: IFilePartItem[] =
      partSize > 0
        ? calcFilePartItemsBySize(fileSize, partSize)
        : calcFilePartItemsByCount(fileSize, partTotal)

    if (fileParts.length <= 1) {
      logger.info(`Seems no need to split. done.`)
      return
    }

    const fileSplitter = new FileSplitter({ partCodePrefix })
    const partFilepaths: string[] = await fileSplitter.split(absoluteFilepath, fileParts, output)
    logger.info(
      `Split done.`,
      partFilepaths
        .map(p => `\n  - ${pathResolver.safeRelative(workspace, p).replace(/\\/g, '/')}`)
        .join(''),
    )
  }
}
