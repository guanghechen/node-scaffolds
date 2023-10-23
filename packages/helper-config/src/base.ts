import { randomBytes } from '@guanghechen/byte'
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
  protected _nonce: string | undefined

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
  protected abstract stringify(data: Data): string

  // IConfig -> string
  protected abstract encode(config: IConfig<Data>): PromiseOr<string>

  // string -> IConfig
  protected abstract decode(stringifiedContent: string): PromiseOr<IConfig<Data>>

  // Generate nonce.
  protected nonce(oldNonce: string | undefined): string | undefined {
    return oldNonce ?? randomBytes(20).toString('hex')
  }

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
    const configContent: string | undefined = await storage.load()
    invariant(configContent !== undefined, `[${title}] Failed to load config.`)

    const config: IConfig<Data> = await this.decode(configContent)
    const { __version__, __mac__, __nonce__, data } = config ?? {}

    // Check if config is compatible.
    invariant(
      typeof __version__ === 'string' && typeof __mac__ === 'string',
      () => `[${title}] Bad config, invalid fields. (${JSON.stringify(config)})`,
    )
    invariant(
      this.isCompatible(__version__),
      `[${title}] Version not compatible. expect(${this.__compatible_version__}), received(${__version__})`,
    )

    // Check if the config mac is matched.
    const content: string = this.stringify(data)
    const mac = calcMac([Buffer.from(content, 'utf8')], this.hashAlgorithm).toString('hex')
    invariant(mac === config.__mac__, () => `[${title}] Bad config, mac is not matched.`)

    const instance: Instance = await this.deserialize(data)
    this._instance = instance
    this._nonce = __nonce__
  }

  public async save(storage: IStorage = this._storage): Promise<void> {
    const title = this.constructor.name + '.save'
    invariant(this._instance !== undefined, `[${title}] No valid data holding.`)

    const data: Data = await this.serialize(this._instance)
    const content: string = this.stringify(data)
    const __mac__: string = calcMac([Buffer.from(content)], this.hashAlgorithm).toString('hex')
    const __nonce__: string | undefined = this.nonce(this._nonce)
    const config: IConfig<Data> = {
      __version__: this.__version__,
      __mac__,
      __nonce__,
      data,
    }
    const stringifiedConfig: string = await this.encode(config)
    await storage.save(stringifiedConfig)
  }

  public async remove(): Promise<void> {
    await this._storage.remove()
    this._instance = undefined
  }
}
