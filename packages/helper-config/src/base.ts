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
}

export abstract class BaseConfigKeeper<Instance, Data> implements IConfigKeeper<Instance> {
  public readonly filepath: string
  public abstract readonly __version__: string
  public abstract readonly __compatible_version__: string

  constructor(props: IBaseConfigKeeperProps) {
    this.filepath = props.filepath
    this._instance = undefined
  }

  protected abstract serialize(instance: Instance): PromiseOr<Data>

  protected abstract deserialize(data: Data): PromiseOr<Instance>

  protected abstract encode(config: IConfig<Data>): PromiseOr<Buffer>

  protected abstract decode(buffer: Buffer): PromiseOr<IConfig<Data>>

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
    const config: IConfig<Data> = await this.decode(buffer)

    // Assert config compatible
    const __version__ = (config as IConfig<unknown>).__version__
    invariant(
      typeof __version__ === 'string',
      () => `[${title}.load] Bad config. (${JSON.stringify(config)})`,
    )
    invariant(
      this.isCompatible(__version__),
      `[${title}.load] Version not compatible. expect(${this.__compatible_version__}), received(${__version__})`,
    )

    this._instance = await this.deserialize(config.data)
  }

  public async save(): Promise<void> {
    const title = this.constructor.name
    invariant(this._instance !== undefined, `[${title}.save] No valid data holding.`)

    const dir: string = path.dirname(this.filepath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    invariant(statSync(dir).isDirectory(), `[${title}.save] Parent path is not a dir. ${dir}`)

    const data: Data = await this.serialize(this._instance)
    const config: IConfig<Data> = { __version__: this.__version__, data }
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
