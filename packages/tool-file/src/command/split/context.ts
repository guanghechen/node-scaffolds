import type { IToolFileSubCommandContext } from '../_base'
import type { IToolFileSplitOptions } from './option'

export interface IToolFileSplitContext extends IToolFileSubCommandContext {
  readonly output: string | undefined
  readonly partCodePrefix: string
  readonly partSize: number | undefined
  readonly partTotal: number | undefined
  readonly workspace: string
}

export async function createFileSplitContextFromOptions(
  options: IToolFileSplitOptions,
): Promise<IToolFileSplitContext> {
  const context: IToolFileSplitContext = {
    output: options.output,
    partCodePrefix: options.partCodePrefix,
    partSize: options.partSize,
    partTotal: options.partTotal,
    workspace: options.workspace,
  }
  return context
}
