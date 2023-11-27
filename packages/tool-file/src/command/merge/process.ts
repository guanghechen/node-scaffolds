import { FileSplitter } from '@guanghechen/file-split'
import { isDirectorySync } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import { pathResolver } from '@guanghechen/path'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { IToolFileSubCommandProcessor } from '../_base'
import { ToolFileSubCommandProcessor } from '../_base'
import type { IToolFileMergeContext } from './context'
import type { IToolFileMergeOptions } from './option'

type O = IToolFileMergeOptions
type C = IToolFileMergeContext

const clazz = 'ToolFileMerge'

export class ToolFileMerge
  extends ToolFileSubCommandProcessor<O, C>
  implements IToolFileSubCommandProcessor<O, C>
{
  public override async process([filepath]: string[]): Promise<void> {
    const title = `${clazz}.process`
    const { context, reporter } = this
    const { workspace, partCodePrefix, output = filepath } = context

    reporter.debug('args: filepath:', filepath)

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
    reporter.info(
      `Merge done.`,
      partFilenames.map(text => `\n  - ${text}`).join('') + `\n==>${output}`,
    )
  }
}
