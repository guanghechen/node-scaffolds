import invariant from '@guanghechen/invariant'
import type { Options as IExecaOptions } from 'execa'
import type { IGitCommandBaseParams, IGitCommitInfo } from '../types'
import { formatGitDate, safeExeca } from '../util'
import { getAllLocalBranches } from './branch'

export interface IListAllFilesParams extends IGitCommandBaseParams {
  branchOrCommitId: string
}

export const listAllFiles = async (params: IListAllFilesParams): Promise<string[]> => {
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd: params.cwd }
  const result = await safeExeca(
    'git',
    ['ls-tree', '--name-only', '-r', params.branchOrCommitId],
    execaOptions,
    params.logger,
  )
  const files: string[] = result.stdout.trim().split(/\s*\n+\s*/g)
  return files
}

export interface IListDiffFiles extends IGitCommandBaseParams {
  olderCommitHash: string
  newerCommitHash: string
}

export const listDiffFiles = async (params: IListDiffFiles): Promise<string[]> => {
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd: params.cwd }
  const result = await safeExeca(
    'git',
    ['diff', '--name-status', '-z', params.olderCommitHash, params.newerCommitHash],
    execaOptions,
    params.logger,
  )

  // Some thing lik: `A^@a.txt^@R^@a b.txt^@a c.txt`
  const items: string[] = result.stdout
    .split('\0')
    .map(text => text.trim())
    .filter(x => !!x)
  const files: string[] = []
  for (let i = 0; i < items.length; i += 1) {
    const symbol: string = items[i]

    i += 1
    invariant(
      i < items.length,
      () => `[listDiffFiles] Bad items. stdout(${result.stdout}), items(${items})`,
    )
    switch (symbol[0]) {
      case 'A': {
        files.push(items[i])
        break
      }
      case 'D': {
        files.push(items[i])
        break
      }
      case 'M': {
        files.push(items[i])
        break
      }
      case 'R': {
        files.push(items[i])
        i += 1
        invariant(i < items.length, `[listDiffFiles] Bad items ${result.stdout}`)
        files.push(items[i])
        break
      }
      /* c8 ignore start */
      default:
        throw new Error(
          `[listDiffFiles] Unknown git change symbol. symbol(${symbol}), stdout(${result.stdout})`,
        )
      /* c8 ignore end */
    }
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
}

export const showCommitInfo = async (
  params: IShowCommitInfoParams,
): Promise<IGitCommitInfo | never> => {
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd: params.cwd }
  const result = await safeExeca(
    'git',
    ['log', '-1', '--format=fuller', '--date=iso', params.branchOrCommitId],
    execaOptions,
    params.logger,
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
    .map(line => line.replace(/^([ ]{4}|\t)/, ''))
    .join('\n')
  return {
    commitId,
    authorDate: formatGitDate(authorDate),
    authorName: authorName.trim(),
    authorEmail: authorEmail.trim(),
    committerDate: formatGitDate(committerDate),
    committerName: committerName.trim(),
    committerEmail: committerEmail.trim(),
    message: message,
  }
}

export interface IGetHeadBranchOrCommitIdParams extends IGitCommandBaseParams {}

export const getHeadBranchOrCommitId = async (
  params: IGetHeadBranchOrCommitIdParams,
): Promise<string | never> => {
  const localBranches = await getAllLocalBranches(params)
  if (localBranches.currentBranch) return localBranches.currentBranch

  const headCommitInfo = await showCommitInfo({
    cwd: params.cwd,
    execaOptions: params.execaOptions,
    logger: params.logger,
    branchOrCommitId: 'HEAD',
  })
  return headCommitInfo.commitId
}

export interface IShowFileContentParams extends IGitCommandBaseParams {
  branchOrCommitId: string
  filepath: string
}

export const showFileContent = async (params: IShowFileContentParams): Promise<string> => {
  const cwd: string = params.cwd
  const env: NodeJS.ProcessEnv = { ...params.execaOptions?.env }
  const args: string[] = ['show', `${params.branchOrCommitId}:${params.filepath}`]

  params?.logger?.debug(`[checkBranch] cwd: {}, args: {}, env: {}`, cwd, args, env)
  const execaOptions: IExecaOptions = { ...params.execaOptions, cwd, env, extendEnv: true }
  const { stdout } = await safeExeca('git', args, execaOptions, params.logger)
  return stdout
}
