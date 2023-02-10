import type { ICipher } from '@guanghechen/helper-cipher'
import { rm, writeFile } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import { existsSync, statSync } from 'node:fs'
import fs from 'node:fs/promises'
import type { IJsonConfig, IJsonConfigKeeper } from './types/IJsonConfigKeeper'

export interface IJsonConfigKeeperProps<Instance, Data = Instance> {
  readonly cipher: ICipher
  readonly filepath: string
  readonly __version__: string
  serialize?(data: Instance): Data
  deserialize?(content: Data): Instance
  getDefaultInstance?(): Instance | null
}

export class JsonConfigKeeper<Instance, Data = Instance> implements IJsonConfigKeeper<Instance> {
  public readonly cipher: ICipher
  public readonly filepath: string
  private readonly __version__: string
  private readonly serialize: (data: Instance) => Data
  private readonly deserialize: (content: Data) => Instance
  private readonly getDefaultInstance: () => Instance | null

  constructor(props: IJsonConfigKeeperProps<Instance, Data>) {
    this.cipher = props.cipher
    this.filepath = props.filepath
    this.__version__ = props.__version__
    this.serialize = props.serialize ?? (data => data as unknown as Data)
    this.deserialize = props.deserialize ?? (content => content as unknown as Instance)
    this.getDefaultInstance = props.getDefaultInstance ?? (() => null)
  }

  public async load(): Promise<Instance | null> {
    if (!existsSync(this.filepath)) return this.getDefaultInstance()

    invariant(
      statSync(this.filepath).isFile(),
      `[JsonConfigKeeper.load] not a file. (${this.filepath})`,
    )

    const encryptedContent: Buffer = await fs.readFile(this.filepath)
    const config = this.cipher.decryptJson(encryptedContent) as IJsonConfig
    invariant(
      config.version === this.__version__,
      `[JsonConfigKeeper.load] config data's version is not matched. expect(${this.__version__}), received(${config.version})`,
    )
    return this.deserialize(config.data as Data)
  }

  public async save(data: Instance): Promise<void> {
    const serializedData = this.serialize(data)
    const config: IJsonConfig = { version: this.__version__, data: serializedData }
    const { cryptBytes } = this.cipher.encryptJson(config)
    await writeFile(this.filepath, cryptBytes)
  }

  public async remove(): Promise<void> {
    await rm(this.filepath)
  }
}
