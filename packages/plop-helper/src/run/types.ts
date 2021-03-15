import type nodePlop from 'node-plop'

export type NodePlopAPI = ReturnType<typeof nodePlop>

export interface PlopActionHooksChanges {
  type: string
  path: string
}

export interface PlopActionHooksFailures {
  type: string
  path: string
  error: string
  message: string
}

export interface RunGeneratorOptions {
  /**
   * Whether if display literal change type names instead of symbolic ones.
   * @default false
   */
  showTypeNames?: boolean
}
