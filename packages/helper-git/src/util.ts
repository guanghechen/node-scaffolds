import type { Options as IExecaOptions, ExecaReturnValue as IExecaReturnValue } from 'execa'
import { execa } from 'execa'

export async function safeExeca(
  file: string,
  args: string[],
  options?: IExecaOptions,
): Promise<IExecaReturnValue | never> {
  try {
    const result: IExecaReturnValue = await execa(file, args, options)
    return result
  } catch (error) {
    const cmdArgs = args
      .map(arg => (/\s/.test(arg) ? `'${arg.replace(/'/g, `'\\''`)}'` : arg))
      .join(' ')
    console.error('[safeExeca] failed to run:', file, cmdArgs)
    throw error
  }
}
