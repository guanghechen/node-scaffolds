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
  readonly import: string | undefined
  readonly require: string | undefined
  readonly source: string[]
  readonly types: string | undefined
}
