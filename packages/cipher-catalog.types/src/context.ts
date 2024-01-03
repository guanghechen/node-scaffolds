import type { ICipherCatalogStat } from './stat'

export type IHashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512'

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
   * Generate a nonce with the given size.
   */
  genNonce(): Promise<Uint8Array>

  /**
   * Calculate fingerprint for the given plain file.
   * @param plainPath
   */
  hashPlainFile(plainPath: string): Promise<string>

  /**
   * Check if the given cryptPath (or file part) exist.
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
   * Normalize the given path to get a stable crypt path across platforms.
   * @param filepath
   */
  normalizeCryptPath(filepath: string): string | never

  /**
   * Normalize the given path to get a stable plain path across platforms.
   * @param filepath
   */
  normalizePlainPath(filepath: string): string | never

  /**
   * Get the plain file stat.
   * @param plainPath
   */
  statPlainFile(plainPath: string): Promise<ICipherCatalogStat | undefined>

  /**
   * Get the crypt file stat.
   * @param cryptPath
   */
  statCryptFile(cryptPath: string): Promise<ICipherCatalogStat | undefined>
}
