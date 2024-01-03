import type { CatalogItemFlagEnum } from '../constant'

export interface ISerializedCatalogItem {
  /**
   * Authenticate tag.
   * - hex string
   */
  authTag: string | undefined

  /**
   * Fingerprint of contents of the plain file.
   * - hex string
   */
  fingerprint: string

  /**
   * Indicate the special logics on the source file.
   */
  flag: CatalogItemFlagEnum

  /**
   * IV for AES-GCM.
   * - hex string
   */
  nonce: string

  /**
   * The path of the plain source file.
   * - relative path of the plain root directory
   * - encrypted
   * - base64 string.
   */
  plainPath: string

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
