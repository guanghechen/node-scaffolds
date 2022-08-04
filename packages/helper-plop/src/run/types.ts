export interface IPlopActionHooksChanges {
  type: string
  path: string
}

export interface IPlopActionHooksFailures {
  type: string
  path: string
  error: string
  message: string
}

export interface IRunGeneratorOptions {
  /**
   * Whether if display literal change type names instead of symbolic ones.
   * @default false
   */
  showTypeNames?: boolean
}
