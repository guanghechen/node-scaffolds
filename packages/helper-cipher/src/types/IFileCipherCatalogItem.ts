import type { FileChangeType } from '../constant'

export interface IFileCipherCatalogItem {
  /**
   * The path of the source file (relative path of the source root directory).
   *
   * The value should be unique in file catalog.
   */
  sourceFilepath: string
  /**
   * The path of the encrypted file (relative path of the target root directory).
   */
  encryptedFilepath: string
  /**
   * Parts path of the target file.
   *
   * If this is a non-empty array, it means that the target file is split into multiple parts,
   * where each element of the array corresponds to the file path (relative path of the target root
   * directory) of each part.
   */
  targetParts: string[]
  /**
   * Fingerprint of contents of the source file.
   */
  fingerprint: string
  /**
   * The size of the source file (in bytes).
   */
  size: number
  /**
   * Whether if keep plain.
   */
  keepPlain: boolean
}

export type IFileCipherCatalogItemDiff =
  | {
      changeType: FileChangeType.ADDED
      newItem: Readonly<IFileCipherCatalogItem>
    }
  | {
      changeType: FileChangeType.MODIFIED
      oldItem: Readonly<IFileCipherCatalogItem>
      newItem: Readonly<IFileCipherCatalogItem>
    }
  | {
      changeType: FileChangeType.REMOVED
      oldItem: Readonly<IFileCipherCatalogItem>
    }
