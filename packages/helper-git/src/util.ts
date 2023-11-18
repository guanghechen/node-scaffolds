import type { IReporter } from '@guanghechen/reporter.types'
import type { Options as IExecaOptions, ExecaReturnValue as IExecaReturnValue } from 'execa'
import { execa } from 'execa'
import { existsSync, statSync } from 'node:fs'
import path from 'node:path'

export async function safeExeca(
  file: string,
  args: string[],
  options: IExecaOptions,
  logger: IReporter | undefined,
): Promise<IExecaReturnValue | never> {
  try {
    const result: IExecaReturnValue = await execa(file, args, { ...options, encoding: 'utf8' })
    return result
  } catch (error) {
    logger?.error?.(`[safeExeca] failed to run ${file}.`, '\nargs:', args, '\noptions:', {
      ...options,
      encoding: 'utf8',
    })
    throw error
  }
}

export const isGitRepo = (repoDir: string): boolean => {
  const gitDir = path.join(repoDir, '.git')
  return existsSync(gitDir) && statSync(gitDir).isDirectory()
}

export const formatGitDate = (dateString: string): string => {
  return dateString
}
