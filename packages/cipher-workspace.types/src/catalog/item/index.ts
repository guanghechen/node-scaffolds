export * from './deserialized'
export * from './draft'
export * from './serialized'

export interface ICatalogItem {
  /**
   * Authenticate tag.
   */
  authTag: Uint8Array | undefined
  /**
   * The path of the encrypted file (relative path of the encrypted root directory).
   */
  cryptFilepath: string
  /**
   * Parts path of the encrypted file.
   *
   * If this is a non-empty array, it means that the target file is split into multiple parts,
   * where each element of the array is a part of the crypt file (suffix of the cryptFilepath).
   */
  cryptFilepathParts: string[]
  /**
   * Fingerprint of contents of the plain file. (hex string)
   */
  fingerprint: string
  /**
   * Cipher iv.
   */
  iv: Uint8Array | undefined
  /**
   * Whether if keep plain.
   */
  keepPlain: boolean
  /**
   * The path of the plain source file (relative path of the plain root directory).
   *
   * The value should be unique in file catalog.
   */
  plainFilepath: string
}
