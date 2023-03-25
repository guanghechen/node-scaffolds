import {
  BigFileHelper,
  calcFilePartItemsByCount,
  calcFilePartItemsBySize,
} from '@guanghechen/helper-file'
import type { IFilePartItem } from '@guanghechen/helper-file'
import { isFileSync } from '@guanghechen/helper-fs'
import { absoluteOfWorkspace, relativeOfWorkspace } from '@guanghechen/helper-path'
import invariant from '@guanghechen/invariant'
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
    const { workspace, partCodePrefix, partSize = 0, partTotal = 1 } = this.context

    logger.debug('args: filepath:', filepath)

    const absoluteFilepath = absoluteOfWorkspace(workspace, filepath)
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

    const bigFileHelper = new BigFileHelper({ partCodePrefix })
    const partFilepaths: string[] = await bigFileHelper.split(absoluteFilepath, fileParts)
    logger.info(
      `Split done.`,
      partFilepaths
        .map(partFilepath => `\n  - ${relativeOfWorkspace(workspace, partFilepath)}`)
        .join(''),
    )
  }
}
