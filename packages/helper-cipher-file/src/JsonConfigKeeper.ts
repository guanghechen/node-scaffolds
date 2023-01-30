import type { ICipher } from '@guanghechen/helper-cipher'
import { rm, writeFile } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import { existsSync, statSync } from 'node:fs'
import fs from 'node:fs/promises'
import type { IJsonConfig, IJsonConfigKeeper } from './types/IJsonConfigKeeper'

export interface IGitCipherConfigProps<Data, Raw = Data> {
  readonly cipher: ICipher
  readonly configFilepath: string
  readonly __version__: string
  getDefaultData?(): Data | null
  serialize?(data: Data): Raw
  deserialize?(content: Raw): Data
}

export class JsonConfigKeeper<Data, Raw = Data> implements IJsonConfigKeeper<Data> {
  public readonly cipher: ICipher
  public readonly configFilepath: string
  private readonly __version__: string
  private readonly getDefaultData: () => Data | null
  private readonly serialize: (data: Data) => Raw
  private readonly deserialize: (content: Raw) => Data

  constructor(props: IGitCipherConfigProps<Data, Raw>) {
    this.cipher = props.cipher
    this.configFilepath = props.configFilepath
    this.__version__ = props.__version__
    this.getDefaultData = props.getDefaultData ?? (() => null)
    this.serialize = props.serialize ?? (data => data as unknown as Raw)
    this.deserialize = props.deserialize ?? (content => content as unknown as Data)
  }

  public async load(): Promise<Data | null> {
    if (!existsSync(this.configFilepath)) return this.getDefaultData()

    invariant(
      statSync(this.configFilepath).isFile(),
      `[JsonConfigKeeper.load] not a file. (${this.configFilepath})`,
    )

    const encryptedContent: Buffer = await fs.readFile(this.configFilepath)
    const config = this.cipher.decryptJson(encryptedContent) as IJsonConfig

    invariant(
      config.version === this.__version__,
      `[JsonConfigKeeper.load] config data's version is not matched. expect(${this.__version__}), received(${config.version})`,
    )
    return this.deserialize(config.data as Raw)
  }

  public async save(data: Data): Promise<void> {
    const serializedData = this.serialize(data)
    const config: IJsonConfig = { version: this.__version__, data: serializedData }
    const encryptedContent: Buffer = this.cipher.encryptJson(config)
    await writeFile(this.configFilepath, encryptedContent)
  }

  public async remove(): Promise<void> {
    await rm(this.configFilepath)
  }
}
