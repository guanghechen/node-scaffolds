import { FileSplitter } from '@guanghechen/file-split'
import { isDirectorySync } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import { pathResolver } from '@guanghechen/path'
import fs from 'node:fs/promises'
import path from 'node:path'
import { logger } from '../../env/logger'
import type { IFileMergeContext } from './context'

export class FileMergeProcessor {
  protected readonly context: IFileMergeContext

  constructor(context: IFileMergeContext) {
    logger.debug('context:', context)

    this.context = context
  }

  public async merge([filepath]: string[]): Promise<void> {
    const title = 'processor.merge'
    const { workspace, partCodePrefix, output = filepath } = this.context

    logger.debug('args: filepath:', filepath)

    const { dir, base } = path.parse(pathResolver.safeResolve(workspace, filepath))
    invariant(isDirectorySync(dir), `[${title}] Cannot find ${dir}`)

    const filenames: string[] = await fs.readdir(dir)
    const partFilenames: string[] = filenames
      .map(filename => {
        const order = Number.parseInt(filename.slice((base + partCodePrefix).length))
        return { filename, order }
      })
      .filter(item => !Number.isNaN(item.order))
      .sort((x, y) => x.order - y.order)
      .map(item => item.filename)
    const absolutePartFilepaths: string[] = partFilenames.map(filename => path.join(dir, filename))

    const fileSplitter = new FileSplitter({ partCodePrefix })
    await fileSplitter.merge(absolutePartFilepaths, output)
    logger.info(
      `Merge done.`,
      partFilenames.map(text => `\n  - ${text}`).join('') + `\n==>${output}`,
    )
  }
}
