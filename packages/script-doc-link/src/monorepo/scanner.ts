import { isFileSync } from '@guanghechen/fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { IMonorepoRewriteAbleItem } from '../types'
import type { MonorepoContext } from './context'

export interface IMonorepoDocScannerProps {
  context: Readonly<MonorepoContext>
}

export class MonorepoDocScanner {
  public readonly context: Readonly<MonorepoContext>

  constructor(props: IMonorepoDocScannerProps) {
    this.context = props.context
  }

  public async scan(): Promise<IMonorepoRewriteAbleItem[]> {
    const items: IMonorepoRewriteAbleItem[] = []
    for (const packagePath of this.context.packagePaths) {
      const dirPath: string = path.join(this.context.rootDir, packagePath)
      const filenames: string[] = await fs.readdir(dirPath)
      for (const filename of filenames) {
        if (filename === 'package.json' || /^README\./i.test(filename)) {
          const filepath: string = path.join(dirPath, filename)
          items.push({ filepath, packagePath })
        }
      }
    }
    return items.filter(item => isFileSync(item.filepath))
  }
}
