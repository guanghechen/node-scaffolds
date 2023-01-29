import invariant from '@guanghechen/invariant'
import type { ILogger } from '@guanghechen/utility-types'
import dayjs from 'dayjs'
import type { Options as IExecaOptions } from 'execa'
import type { IGitCommitInfo } from '../types'
import { safeExeca } from '../util'

export interface IListAllFilesOptions {
  cwd: string
  commitId: string
  execaOptions?: IExecaOptions
  logger?: ILogger
}

export const listAllFiles = async (options: IListAllFilesOptions): Promise<string[]> => {
  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd: options.cwd }
  const result = await safeExeca(
    'git',
    ['ls-tree', '--name-only', '-r', options.commitId],
    execaOptions,
  )
  const files: string[] = result.stdout.trim().split(/\s*\n+\s*/g)
  return files
}

export interface IListChangedFilesOptions {
  cwd: string
  commitId: string
  parentIds: string[]
  execaOptions?: IExecaOptions
  logger?: ILogger
}

export const listChangedFiles = async (options: IListChangedFilesOptions): Promise<string[]> => {
  if (options.parentIds.length <= 0) return await listAllFiles(options)

  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd: options.cwd }
  if (options.parentIds.length > 1) {
    const fileSet: Set<string> = new Set()
    for (const parentId of options.parentIds) {
      const pFiles: string[] = await getChangedFilesFromCommitId(parentId)
      for (const id of pFiles) fileSet.add(id)
    }
    const files: string[] = await getChangedFilesFromCommitId(options.commitId)
    for (const id of files) fileSet.add(id)
    return Array.from(fileSet).filter(x => !!x)
  } else {
    const files: string[] = await getChangedFilesFromCommitId(options.commitId)
    return files.filter(x => !!x)
  }

  async function getChangedFilesFromCommitId(commitId: string): Promise<string[]> {
    const result = await safeExeca(
      'git',
      ['diff-tree', '--no-commit-id', '--name-only', '-r', commitId],
      execaOptions,
    )
    const files: string[] = result.stdout.trim().split(/\s*\n+\s*/g)
    return files
  }
}

const regex = new RegExp(
  [
    /commit\s*([\da-f]+)(?:[\s\S]*?)/, // commit id
    /Author:\s*([\S ]+?)\s*<([^>]+)>/, // author name and author email
    /AuthorDate:\s*([^\n]+?)/, // author date
    /Commit:\s*([\S ]+?)\s*<([^>]+)>/, // committer name and committer email
    /CommitDate:\s*([^\n]+?)/, // commit date
    /([\s\S]+)/, // message
  ]
    .map(regex => regex.source)
    .join('\\n\\s*'),
)

export interface IShowCommitInfoOptions {
  cwd: string
  commitId: string
  execaOptions?: IExecaOptions
  logger?: ILogger
  /**
   * @default '    '
   */
  messagePrefix?: string
}

export const showCommitInfo = async (
  options: IShowCommitInfoOptions,
): Promise<IGitCommitInfo | never> => {
  const messagePrefix: string = options.messagePrefix ?? '    '
  const execaOptions: IExecaOptions = { ...options.execaOptions, cwd: options.cwd }
  const result = await safeExeca(
    'git',
    ['log', '-1', '--format=fuller', options.commitId],
    execaOptions,
  )
  const text: string = result.stdout
  const match = text.match(regex)
  invariant(match != null, () => `[listCommitInfo] bad commit. ${text}`)

  const [
    ,
    commitId,
    authorName,
    authorEmail,
    authorDate,
    committerName,
    committerEmail,
    committerDate,
    rawMessage,
  ] = match
  const message: string = rawMessage
    .split(/\n/g)
    .map(line => (line.startsWith(messagePrefix) ? line.slice(messagePrefix.length) : line))
    .join('\n')
  return {
    commitId,
    authorDate: dayjs(authorDate).toISOString(),
    authorName: authorName.trim(),
    authorEmail: authorEmail.trim(),
    committerDate: dayjs(committerDate).toISOString(),
    committerName: committerName.trim(),
    committerEmail: committerEmail.trim(),
    message: message,
  }
}
