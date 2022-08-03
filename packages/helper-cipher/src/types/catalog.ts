/**
 * A catalog item.
 */
export interface ICatalogItem {
  /**
   * Fingerprint of contents of source file.
   */
  fingerprint: string
  /**
   * The size of the source file (in bytes).
   */
  size: number
  /**
   * Last modify time of the plaintext file (ISO date string).
   */
  mtime: string
  /**
   * The path of the source file (relative path of the workspace directory).
   */
  sourceFilepath: string
  /**
   * Target filename
   */
  targetFilename: string
  /**
   * Parts path of the target file.
   */
  targetParts: string[]
}

/**
 * Catalog index.
 */
export interface ICatalogIndex {
  /**
   * Catalog items.
   */
  items: ICatalogItem[]

  /**
   * Last check time. All source files whose modification date is less than or
   * equal to this time are considered unchanged.
   */
  lastCheckTime: string | null
}
