export interface IConfig<D> {
  /**
   * Config version.
   */
  __version__: string
  /**
   * Payload data.
   */
  data: D
}

export interface IConfigKeeper<D> {
  readonly __version__: string
  readonly __compatible_version__: string

  /**
   * The path where the configuration file is located.
   */
  readonly filepath: string

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
   * Load data from config file.
   */
  load(): Promise<void>

  /**
   * Save current holding data into the config file.
   */
  save(): Promise<void>

  /**
   * Remove the config file.
   */
  remove(): Promise<void>
}
