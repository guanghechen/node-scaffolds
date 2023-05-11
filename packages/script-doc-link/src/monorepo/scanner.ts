import { isFileSync } from '@guanghechen/helper-fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { IDocScanner } from '../types'
import type { MonorepoContext } from './context'

export interface IMonorepoDocScannerProps {
  context: Readonly<MonorepoContext>
}

export class MonorepoDocScanner implements IDocScanner {
  public readonly context: Readonly<MonorepoContext>

  constructor(props: IMonorepoDocScannerProps) {
    this.context = props.context
  }

  public async scan(): Promise<string[]> {
    const filepaths: string[] = []
    for (const packagePath of this.context.packagePaths) {
      const dirPath: string = path.join(this.context.rootDir, packagePath)
      const filenames: string[] = await fs.readdir(dirPath)
      for (const filename of filenames) {
        if (filename === 'package.json' || /^README\./i.test(filename)) {
          const filepath: string = path.join(dirPath, filename)
          filepaths.push(filepath)
        }
      }
    }
    return filepaths.filter(filepath => isFileSync(filepath))
  }
}
