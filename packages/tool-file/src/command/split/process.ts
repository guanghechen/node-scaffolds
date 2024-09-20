import { FileSplitter } from '@guanghechen/file-split'
import type { IFilePartItem } from '@guanghechen/filepart'
import { calcFilePartItemsByCount, calcFilePartItemsBySize } from '@guanghechen/filepart'
import { isFileSync } from '@guanghechen/fs'
import invariant from '@guanghechen/invariant'
import { pathResolver } from '@guanghechen/path'
import fs from 'node:fs/promises'
import type { IToolFileSubCommandProcessor } from '../_base'
import { ToolFileSubCommandProcessor } from '../_base'
import type { IToolFileSplitContext } from './context'
import type { IToolFileSplitOptions } from './option'

type O = IToolFileSplitOptions
type C = IToolFileSplitContext

const clazz = 'ToolFileSplit'

export class ToolFileSplit
  extends ToolFileSubCommandProcessor<O, C>
  implements IToolFileSubCommandProcessor<O, C>
{
  public override async process([filepath]: string[]): Promise<void> {
    const title = `${clazz}.process`
    const { context, reporter } = this
    const { workspace, partCodePrefix, partSize = 0, partTotal = 1, output } = context

    reporter.debug('args: filepath:', filepath)

    const absoluteFilepath = pathResolver.safeResolve(workspace, filepath)
    invariant(isFileSync(absoluteFilepath), `[${title}] Cannot find ${absoluteFilepath}.`)

    const fileSize: number = await fs.stat(absoluteFilepath).then(file => file.size)
    const fileParts: IFilePartItem[] = Array.from(
      partSize > 0
        ? calcFilePartItemsBySize(fileSize, partSize)
        : calcFilePartItemsByCount(fileSize, partTotal),
    )

    if (fileParts.length <= 1) {
      reporter.info('Seems no need to split. done.')
      return
    }

    const fileSplitter = new FileSplitter({ partCodePrefix })
    const partFilepaths: string[] = await fileSplitter.split(absoluteFilepath, fileParts, output)
    reporter.info(
      'Split done.',
      partFilepaths.map(p => `\n  - ${pathResolver.safeRelative(workspace, p)}`).join(''),
    )
  }
}
