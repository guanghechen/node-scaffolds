import type { ISubCommandSplitOptions } from './option'

export interface IFileSplitContext {
  readonly output: string | undefined
  readonly partCodePrefix: string
  readonly partSize: number | undefined
  readonly partTotal: number | undefined
  readonly workspace: string
}

export async function createFileSplitContextFromOptions(
  options: ISubCommandSplitOptions,
): Promise<IFileSplitContext> {
  const context: IFileSplitContext = {
    output: options.output,
    partCodePrefix: options.partCodePrefix,
    partSize: options.partSize,
    partTotal: options.partTotal,
    workspace: options.workspace,
  }
  return context
}
