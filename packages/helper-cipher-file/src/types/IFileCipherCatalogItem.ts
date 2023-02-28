export interface IFileCipherCatalogItemBase {
  /**
   * The path of the plain source file (relative path of the plain root directory).
   *
   * The value should be unique in file catalog.
   */
  plainFilepath: string
  /**
   * Parts path of the encrypted file.
   *
   * If this is a non-empty array, it means that the target file is split into multiple parts,
   * where each element of the array is a part of the crypt file (suffix of the cryptFilepath).
   */
  cryptFilepathParts: string[]
  /**
   * Fingerprint of contents of the plain file.
   */
  fingerprint: string
  /**
   * Whether if keep plain.
   */
  keepPlain: boolean
}

export interface IFileCipherCatalogItemDraft extends IFileCipherCatalogItemBase {
  /**
   * The path of the encrypted file (relative path of the encrypted root directory).
   */
  cryptFilepath: string
}

export interface IFileCipherCatalogItem extends IFileCipherCatalogItemDraft {
  /**
   * Cipher iv (hex string).
   */
  iv: Buffer | undefined
  /**
   * Authenticate tag (hex string).
   */
  authTag: Buffer | undefined
}
