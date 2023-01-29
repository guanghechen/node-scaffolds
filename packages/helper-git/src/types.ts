import type { ILogger } from '@guanghechen/utility-types'
import type { Options as IExecaOptions } from 'execa'

export interface IGitCommitDagNode {
  id: string
  parents: string[]
}

export interface IGitCheckOptions {
  cwd: string
  commitId: string
  execaOptions?: IExecaOptions
  logger?: ILogger
}

export interface IGitCommitInfo {
  commitId: string
  authorDate: string
  authorName: string
  authorEmail: string
  committerDate: string
  committerName: string
  committerEmail: string
  message: string
}

export interface IGitCommitOptions extends Partial<Omit<IGitCommitInfo, 'commitId'>> {
  cwd: string
  message: string
  amend: boolean
  execaOptions?: IExecaOptions
  logger?: ILogger
}

export interface IGitMergeOptions extends Partial<Omit<IGitCommitInfo, 'commitId'>> {
  cwd: string
  message: string
  parentIds: string[]
  execaOptions?: IExecaOptions
  logger?: ILogger
}

export interface IGitInitOptions {
  cwd: string
  defaultBranch?: string
  authorName?: string
  authorEmail?: string
  execaOptions?: IExecaOptions
  logger?: ILogger
}

export interface IGitStageOptions {
  cwd: string
  execaOptions?: IExecaOptions
  logger?: ILogger
}

export interface IGitCleanUntrackedOptions {
  cwd: string
  filepaths: string[]
  execaOptions?: IExecaOptions
  logger?: ILogger
}

export interface ICommitViewOptions {
  cwd: string
  commitId: string
  execaOptions?: IExecaOptions
  logger?: ILogger
}

export interface ICommitViewChangedFilesOptions extends ICommitViewOptions {
  parentIds: string[]
}

export interface ICommitViewShowInfoOptions extends ICommitViewOptions {
  /**
   * @default '    '
   */
  messagePrefix?: string
}
