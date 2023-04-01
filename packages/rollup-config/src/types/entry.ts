export interface IRawEntryItem {
  /**
   * The ESM module entry filepath.
   */
  import?: string
  /**
   * The CJS module entry filepath.
   */
  require?: string
  /**
   * The input file(s).
   */
  source?: string | string[]
  /**
   * The types filepath.
   */
  types?: string
}

export interface IEntryItem {
  import: string | undefined
  require: string | undefined
  source: string[]
  types: string | undefined
}
