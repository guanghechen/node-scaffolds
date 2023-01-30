export interface IJsonConfig {
  version: string
  data: unknown
}

export interface IJsonConfigKeeper<D> {
  /**
   * Config file path.
   */
  readonly filepath: string

  /**
   * Load config data.
   */
  load(): Promise<D | null>

  /**
   * Save config data.
   * @param data
   */
  save(data: D): Promise<void>

  /**
   * Remove the config file.
   */
  remove(): Promise<void>
}
