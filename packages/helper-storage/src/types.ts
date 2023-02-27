/**
 * Read / Write / Delete content.
 */
export interface IStorage {
  /**
   * Check if the content exist.
   */
  exists(): Promise<boolean>

  /**
   * Load data from config file.
   */
  load(): Promise<string | undefined>

  /**
   * Save current holding data into the config file.
   */
  save(content: string): Promise<void>

  /**
   * Remove the config file.
   */
  remove(): Promise<void>
}
