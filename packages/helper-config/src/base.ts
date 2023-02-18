import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import { calcMac } from '@guanghechen/helper-mac'
import invariant from '@guanghechen/invariant'
import type { PromiseOr } from '@guanghechen/utility-types'
import { existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import semver from 'semver'
import type { IConfig, IConfigKeeper } from './types'

export interface IBaseConfigKeeperProps {
  /**
   * The path where configuration file is located.
   */
  filepath: string
  /**
   * The hash algorithm for generate mac of contents.
   * @default 'sha256'
   */
  hashAlgorithm?: IHashAlgorithm
}

export abstract class BaseConfigKeeper<Instance, Data> implements IConfigKeeper<Instance> {
  public readonly filepath: string
  public readonly hashAlgorithm: IHashAlgorithm
  public abstract readonly __version__: string
  public abstract readonly __compatible_version__: string

  constructor(props: IBaseConfigKeeperProps) {
    this.filepath = props.filepath
    this.hashAlgorithm = props.hashAlgorithm ?? 'sha256'
    this._instance = undefined
  }

  // Instance -> Data
  protected abstract serialize(instance: Instance): PromiseOr<Data>

  // Data -> Instance
  protected abstract deserialize(data: Data): PromiseOr<Instance>

  // Data -> string
  protected abstract stringify(data: Data): PromiseOr<string>

  // string -> Data
  protected abstract parse(content: string): PromiseOr<Data>

  // IConfig -> Buffer
  protected abstract encode(config: IConfig): PromiseOr<Buffer>

  // Buffer -> IConfig
  protected abstract decode(buffer: Buffer): PromiseOr<IConfig>

  protected _instance: Instance | undefined
  public get data(): Readonly<Instance> | undefined {
    return this._instance
  }

  public isCompatible(version: string): boolean {
    return semver.satisfies(version, this.__compatible_version__, {
      loose: false,
      includePrerelease: true,
    })
  }

  public async update(instance: Instance): Promise<void> {
    this._instance = instance
  }

  public async load(): Promise<void> {
    const title: string = this.constructor.name

    // Assert config file exists.
    invariant(existsSync(this.filepath), `[${title}.load] Cannot find file. ${this.filepath}.`)
    invariant(statSync(this.filepath).isFile(), `[${title}.load] Not a file. ${this.filepath}`)

    const buffer: Buffer = await fs.readFile(this.filepath)
    const config: IConfig = await this.decode(buffer)

    // Assert config is compatible.
    const { __version__, __mac__, data: rawData } = config ?? {}
    invariant(
      typeof __version__ === 'string' && typeof __mac__ === 'string' && typeof rawData === 'string',
      () => `[${title}.load] Bad config, invalid fields. (${JSON.stringify(config)})`,
    )
    invariant(
      this.isCompatible(__version__),
      `[${title}.load] Version not compatible. expect(${this.__compatible_version__}), received(${__version__})`,
    )

    // Assert config mac is matched.
    const mac = calcMac([Buffer.from(config.data, 'utf8')], this.hashAlgorithm).toString('hex')
    invariant(mac === config.__mac__, () => `[${title}.load] Bad config, mac is not matched.`)

    const data: Data = await this.parse(config.data)
    const instance: Instance = await this.deserialize(data)
    this._instance = instance
  }

  public async save(): Promise<void> {
    const title = this.constructor.name
    invariant(this._instance !== undefined, `[${title}.save] No valid data holding.`)

    const dir: string = path.dirname(this.filepath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    invariant(statSync(dir).isDirectory(), `[${title}.save] Parent path is not a dir. ${dir}`)

    const data: Data = await this.serialize(this._instance)
    const content: string = await this.stringify(data)
    const mac: string = calcMac([Buffer.from(content)], this.hashAlgorithm).toString('hex')
    const config: IConfig = { __version__: this.__version__, __mac__: mac, data: content }
    const buffer: Buffer = await this.encode(config)
    await fs.writeFile(this.filepath, buffer)
  }

  public async remove(): Promise<void> {
    const title: string = this.constructor.name
    if (existsSync(this.filepath)) {
      invariant(statSync(this.filepath).isFile(), `[${title}.remove] Not a file.`)
      unlinkSync(this.filepath)
    }
    this._instance = undefined
  }
}
