import type { IHashAlgorithm } from '@guanghechen/helper-mac'
import { calcMac } from '@guanghechen/helper-mac'
import type { IStorage } from '@guanghechen/helper-storage'
import invariant from '@guanghechen/invariant'
import type { PromiseOr } from '@guanghechen/utility-types'
import semver from 'semver'
import type { IConfig, IConfigKeeper } from './types'

export interface IBaseConfigKeeperProps {
  /**
   * The storage to save config data.
   */
  storage: IStorage
  /**
   * The hash algorithm for generate mac of contents.
   * @default 'sha256'
   */
  hashAlgorithm?: IHashAlgorithm
}

export abstract class BaseConfigKeeper<Instance, Data> implements IConfigKeeper<Instance> {
  public readonly hashAlgorithm: IHashAlgorithm
  public abstract readonly __version__: string
  public abstract readonly __compatible_version__: string

  protected readonly _storage: IStorage
  protected _instance: Instance | undefined

  constructor(props: IBaseConfigKeeperProps) {
    this.hashAlgorithm = props.hashAlgorithm ?? 'sha256'
    this._storage = props.storage
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

  // IConfig -> string
  protected abstract encode(config: IConfig): PromiseOr<string>

  // string -> IConfig
  protected abstract decode(stringifiedContent: string): PromiseOr<IConfig>

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

  public async load(storage: IStorage = this._storage): Promise<void> {
    const title: string = this.constructor.name + '.load'
    const content: string | undefined = await storage.load()
    invariant(content !== undefined, `Failed to load content.`)

    const config: IConfig = await this.decode(content)

    // Assert config is compatible.
    const { __version__, __mac__, data: rawData } = config ?? {}
    invariant(
      typeof __version__ === 'string' && typeof __mac__ === 'string' && typeof rawData === 'string',
      () => `[${title}] Bad config, invalid fields. (${JSON.stringify(config)})`,
    )
    invariant(
      this.isCompatible(__version__),
      `[${title}] Version not compatible. expect(${this.__compatible_version__}), received(${__version__})`,
    )

    // Assert config mac is matched.
    const mac = calcMac([Buffer.from(config.data, 'utf8')], this.hashAlgorithm).toString('hex')
    invariant(mac === config.__mac__, () => `[${title}] Bad config, mac is not matched.`)

    const data: Data = await this.parse(config.data)
    const instance: Instance = await this.deserialize(data)
    this._instance = instance
  }

  public async save(storage: IStorage = this._storage): Promise<void> {
    const title = this.constructor.name + '.save'
    invariant(this._instance !== undefined, `[${title}] No valid data holding.`)

    const data: Data = await this.serialize(this._instance)
    const content: string = await this.stringify(data)
    const mac: string = calcMac([Buffer.from(content)], this.hashAlgorithm).toString('hex')
    const config: IConfig = { __version__: this.__version__, __mac__: mac, data: content }
    const stringifiedConfig: string = await this.encode(config)
    await storage.save(stringifiedConfig)
  }

  public async remove(): Promise<void> {
    await this._storage.remove()
    this._instance = undefined
  }
}
