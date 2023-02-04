import dayjs from 'dayjs'
import type { Options as IExecaOptions, ExecaReturnValue as IExecaReturnValue } from 'execa'
import { execa } from 'execa'
import { existsSync, statSync } from 'node:fs'
import path from 'node:path'

export async function safeExeca(
  file: string,
  args: string[],
  options: IExecaOptions,
): Promise<IExecaReturnValue | never> {
  try {
    const result: IExecaReturnValue = await execa(file, args, { ...options, encoding: 'utf8' })
    return result
  } catch (error) {
    const cmdArgs = args
      .map(arg => (/\s/.test(arg) ? `'${arg.replace(/'/g, `'\\''`)}'` : arg))
      .join(' ')
    console.error('[safeExeca] failed to run:', file, cmdArgs)
    throw error
  }
}

export const isGitRepo = (repoDir: string): boolean => {
  const gitDir = path.join(repoDir, '.git')
  return existsSync(gitDir) && statSync(gitDir).isDirectory()
}

export const formatGitDate = (dateString: string): string => {
  return dayjs(dateString).toISOString()
}
