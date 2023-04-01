import type { IRawEntryItem } from './entry'

export interface IManifestEntryFields {
  /**
   * The default CJS module entry filepath.
   */
  readonly main?: string
  /**
   * The default ESM entry filepath.
   */
  readonly module?: string
  /**
   * The default entry input file(s).
   */
  readonly source: string | string[]
  /**
   * The default types filepath.
   */
  readonly types?: string
  readonly exports?: string | IRawEntryItem | Record<string, IRawEntryItem>
}

export interface IManifestWithDependencies {
  /**
   * Dependency list.
   */
  readonly dependencies?: Record<string, string> | string[]
  /**
   * Optional dependency list.
   */
  readonly optionalDependencies?: Record<string, string> | string[]
  /**
   * Peer dependency list.
   */
  readonly peerDependencies?: Record<string, string> | string[]
}

export interface IManifest extends IManifestEntryFields, IManifestWithDependencies {
  /**
   * Package name.
   */
  readonly name: string
}
