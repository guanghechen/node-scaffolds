import type { FileChangeType } from '../constant'

export interface IFileCipherCatalogItem {
  /**
   * The path of the plain source file (relative path of the plain root directory).
   *
   * The value should be unique in file catalog.
   */
  plainFilepath: string
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

export interface IFileCipherCatalogItemDiffCombine {
  changeType: FileChangeType
  oldItem?: Readonly<IFileCipherCatalogItem>
  newItem?: Readonly<IFileCipherCatalogItem>
}
