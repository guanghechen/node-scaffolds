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

export interface IListDiffFiles extends IGitCommandBaseParams {
  branchOrCommitId1: string
  branchOrCommitId2: string
}

export const listDiffFiles = async (params: IListDiffFiles): Promise<string[]> => {
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd: params.cwd }
  const result = await safeExeca(
    'git',
    ['diff', '--name-status', params.branchOrCommitId1, params.branchOrCommitId2],
    execaOptions,
  )

  const lines: string[] = result.stdout.trim().split(/\s*\n+\s*/g)
  const files: string[] = []
  for (const line of lines) {
    const [symbol, file1, file2] = line.trim().split(/\s+/g)
    if (symbol[0] === 'R') files.push(file1, file2)
    else files.push(file1)
  }
  return files
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
