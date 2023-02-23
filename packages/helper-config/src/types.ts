import type { IStorage } from '@guanghechen/helper-storage'

export interface IConfig {
  /**
   * Config version.
   */
  __version__: string
  /**
   * Mac of data.
   */
  __mac__: string
  /**
   * Payload data.
   */
  data: string
}

export interface IConfigKeeper<D> {
  readonly __version__: string
  readonly __compatible_version__: string

  /**
   * Current holding data.
   */
  readonly data: Readonly<D> | undefined

  /**
   * Check if the given version is compatible.
   * @param version
   */
  isCompatible(version: string): boolean

  /**
   * Update the holding data.
   * @param data
   */
  update(data: D): Promise<void>

  /**
   * Load data from the given storage or default storage.
   */
  load(storage?: IStorage): Promise<void>

  /**
   * Save current holding data into the given storage or default storage.
   */
  save(storage?: IStorage): Promise<void>

  /**
   * Remove the config data.
   */
  remove(): Promise<void>
}
