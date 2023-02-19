export interface IFileCipherCatalogItemBase {
  /**
   * The path of the plain source file (relative path of the plain root directory).
   *
   * The value should be unique in file catalog.
   */
  plainFilepath: string
  /**
   * Fingerprint of contents of the plain file.
   */
  fingerprint: string
  /**
   * The size of the plain file (in bytes).
   */
  size: number
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
  /**
   * Parts path of the encrypted file.
   *
   * If this is a non-empty array, it means that the target file is split into multiple parts,
   * where each element of the array corresponds to the file path (relative path of the target root
   * directory) of each part.
   */
  cryptFileParts: string[]
}

export interface IFileCipherCatalogItem extends IFileCipherCatalogItemDraft {
  /**
   * Cipher iv (hex string).
   */
  iv: string
  /**
   * Authenticate tag (hex string).
   */
  authTag: string | undefined
}
