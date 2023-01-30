import invariant from '@guanghechen/invariant'
import dayjs from 'dayjs'
import type { Options as IExecaOptions } from 'execa'
import type { IGitCommandBaseParams, IGitCommitInfo } from '../types'
import { safeExeca } from '../util'

export interface IListAllFilesParams extends IGitCommandBaseParams {
  branchOrCommitId: string
}

export const listAllFiles = async (params: IListAllFilesParams): Promise<string[]> => {
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd: params.cwd }
  const result = await safeExeca(
    'git',
    ['ls-tree', '--name-only', '-r', params.branchOrCommitId],
    execaOptions,
  )
  const files: string[] = result.stdout.trim().split(/\s*\n+\s*/g)
  return files
}

export interface IListChangedFilesParams extends IGitCommandBaseParams {
  branchOrCommitId: string
  parentIds: string[]
}

export const listChangedFiles = async (params: IListChangedFilesParams): Promise<string[]> => {
  if (params.parentIds.length <= 0) return await listAllFiles(params)

  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd: params.cwd }
  if (params.parentIds.length > 1) {
    const fileSet: Set<string> = new Set()
    for (const parentId of params.parentIds) {
      const pFiles: string[] = await getChangedFilesFromCommitId(parentId)
      for (const id of pFiles) fileSet.add(id)
    }
    const files: string[] = await getChangedFilesFromCommitId(params.branchOrCommitId)
    for (const id of files) fileSet.add(id)
    return Array.from(fileSet).filter(x => !!x)
  } else {
    const files: string[] = await getChangedFilesFromCommitId(params.branchOrCommitId)
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

export interface IShowCommitInfoParams extends IGitCommandBaseParams {
  branchOrCommitId: string
  /**
   * @default '    '
   */
  messagePrefix?: string
}

export const showCommitInfo = async (
  params: IShowCommitInfoParams,
): Promise<IGitCommitInfo | never> => {
  const messagePrefix: string = params.messagePrefix ?? '    '
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd: params.cwd }
  const result = await safeExeca(
    'git',
    ['log', '-1', '--format=fuller', params.branchOrCommitId],
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
