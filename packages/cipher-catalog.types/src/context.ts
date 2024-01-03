export type IHashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512'

export interface ICipherCatalogStat {
  /**
   * File create time.
   */
  ctime: number

  /**
   * File modify time.
   */
  mtime: number

  /**
   * File size.
   */
  size: number
}

/**
 * !!! All plainPath and cryptPath should be relative path and use '/' as path separator.
 * The plainPath should be a relative path based on the plain folder.
 * The cryptPath should be a relative path based on the crypt folder.
 */
export interface ICipherCatalogContext {
  readonly CONTENT_HASH_ALGORITHM: IHashAlgorithm
  readonly CRYPT_FILES_DIR: string
  readonly CRYPT_PATH_SALT: string
  readonly MAX_CRYPT_FILE_SIZE: number
  readonly NONCE_SIZE: number
  readonly PART_CODE_PREFIX: string
  readonly PATH_HASH_ALGORITHM: IHashAlgorithm

  /**
   * Calculate fingerprint for the given plain file.
   * @param plainPath
   */
  calcFingerprint(plainPath: string): Promise<string>

  /**
   * Generate a nonce with the given size.
   */
  genNonce(): Promise<Uint8Array>

  /**
   * Check if the given cryptPath exist.
   * @param cryptPath
   */
  isCryptPathExist(cryptPath: string): Promise<boolean>

  /**
   * Check if the content in the given relativePlainFilepath should be kept integrity.
   * @param plainPath
   */
  isKeepIntegrity(plainPath: string): Promise<boolean>

  /**
   * Check if the plain file should be kept plain.
   * @param plainPath
   */
  isKeepPlain(plainPath: string): Promise<boolean>

  /**
   * Check if the given plainPath exist.
   * @param plainPath
   */
  isPlainPathExist(plainPath: string): Promise<boolean>

  /**
   * Get the plain file stat.
   * @param plainPath
   */
  statPlainFile(plainPath: string): Promise<ICipherCatalogStat | undefined>

  /**
   * Normalize the given relative path to get a stable string across platforms.
   * @param relativePath
   */
  verifyAndNormalizePath(relativePath: string): string | never
}
