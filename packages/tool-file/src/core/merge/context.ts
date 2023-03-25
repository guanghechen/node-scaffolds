import type { ISubCommandMergeOptions } from './option'

export interface IFileMergeContext {
  readonly output: string | undefined
  readonly partCodePrefix: string
  readonly workspace: string
}

export async function createFileMergeContextFromOptions(
  options: ISubCommandMergeOptions,
): Promise<IFileMergeContext> {
  const context: IFileMergeContext = {
    output: options.output,
    partCodePrefix: options.partCodePrefix,
    workspace: options.workspace,
  }
  return context
}
