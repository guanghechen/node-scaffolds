import type { ICipher } from '@guanghechen/helper-cipher'
import type { IJsonConfigKeeper } from '@guanghechen/helper-cipher-file'
import { rm, writeFile } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import { existsSync, statSync } from 'node:fs'
import fs from 'node:fs/promises'
import type { IGitCipherConfigData } from './types'

export interface IGitCipherConfigProps {
  readonly cipher: ICipher
  readonly filepath: string
}

export class GitCipherConfig implements IJsonConfigKeeper<IGitCipherConfigData> {
  public readonly cipher: ICipher
  public readonly filepath: string

  constructor(props: IGitCipherConfigProps) {
    this.cipher = props.cipher
    this.filepath = props.filepath
  }

  public async load(): Promise<IGitCipherConfigData | null> {
    const { cipher, filepath } = this
    if (!existsSync(filepath)) return null

    invariant(statSync(filepath).isFile(), `[GitCipherConfig.load] not a file. (${filepath})`)

    const cryptData: Buffer = await fs.readFile(filepath)
    const plainData: Buffer = cipher.decrypt(cryptData)
    const jsonContent: string = plainData.toString('utf8')
    const data = JSON.parse(jsonContent)
    return data as IGitCipherConfigData
  }

  public async save(data: IGitCipherConfigData): Promise<void> {
    const { cipher, filepath } = this
    const jsonContent: string = JSON.stringify(data)
    const plainData: Buffer = Buffer.from(jsonContent, 'utf8')
    const cryptData: Buffer = cipher.encrypt(plainData)
    await writeFile(filepath, cryptData)
  }

  public async remove(): Promise<void> {
    await rm(this.filepath)
  }
}
