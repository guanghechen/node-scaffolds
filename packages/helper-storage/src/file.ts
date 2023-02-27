import { existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { IStorage } from './types'

export interface IFileStorageProps {
  strict: boolean
  filepath: string
  encoding: BufferEncoding
}

export class FileStorage implements IStorage {
  public readonly strict: boolean
  public readonly filepath: string
  public readonly encoding: BufferEncoding

  constructor(props: IFileStorageProps) {
    this.strict = props.strict
    this.filepath = props.filepath
    this.encoding = props.encoding
  }

  public async exists(): Promise<boolean> {
    return existsSync(this.filepath)
  }

  public async load(): Promise<string | undefined> {
    const title: string = this.constructor.name + '.load'

    if (!existsSync(this.filepath)) {
      if (this.strict) throw new Error(`[${title}] Cannot find file. ${this.filepath}`)
      return undefined
    }

    if (!statSync(this.filepath).isFile())
      throw new Error(`[${title}] Not a file. ${this.filepath}`)

    return await readFile(this.filepath, this.encoding)
  }

  public async save(content: string): Promise<void> {
    const title = this.constructor.name + '.save'

    if (existsSync(this.filepath)) {
      if (!statSync(this.filepath).isFile())
        throw new Error(`[${title}] Not a file. ${this.filepath}`)
    } else {
      const dir: string = path.dirname(this.filepath)
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      else {
        if (!statSync(dir).isDirectory())
          throw new Error(`[${title}] Parent path is not a dir. ${dir}`)
      }
    }

    await writeFile(this.filepath, content, this.encoding)
  }

  public async remove(): Promise<void> {
    const title: string = this.constructor.name
    if (existsSync(this.filepath)) {
      if (!statSync(this.filepath).isFile()) throw new Error(`[${title}.remove] Not a file.`)
      unlinkSync(this.filepath)
    }
  }
}
