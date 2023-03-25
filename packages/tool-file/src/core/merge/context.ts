import type { ISubCommandMergeOptions } from './option'

export interface IFileMergeContext {
  readonly partCodePrefix: string
  readonly partSize: number | undefined
  readonly partTotal: number | undefined
  readonly workspace: string
}

export async function createFileMergeContextFromOptions(
  options: ISubCommandMergeOptions,
): Promise<IFileMergeContext> {
  const context: IFileMergeContext = {
    partCodePrefix: options.partCodePrefix,
    partSize: options.partSize,
    partTotal: options.partTotal,
    workspace: options.workspace,
  }
  return context
}
