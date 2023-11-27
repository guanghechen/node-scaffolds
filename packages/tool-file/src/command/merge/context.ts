import type { IToolFileSubCommandContext } from '../_base'
import type { IToolFileMergeOptions } from './option'

export interface IToolFileMergeContext extends IToolFileSubCommandContext {
  readonly output: string | undefined
  readonly partCodePrefix: string
  readonly workspace: string
}

export async function createFileMergeContextFromOptions(
  options: IToolFileMergeOptions,
): Promise<IToolFileMergeContext> {
  const context: IToolFileMergeContext = {
    output: options.output,
    partCodePrefix: options.partCodePrefix,
    workspace: options.workspace,
  }
  return context
}
