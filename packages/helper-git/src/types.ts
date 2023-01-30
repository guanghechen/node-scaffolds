import type { ILogger } from '@guanghechen/utility-types'
import type { Options as IExecaOptions } from 'execa'

export interface IGitCommitDagNode {
  id: string
  parents: string[]
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

export interface IGitCommandBaseParams {
  cwd: string
  execaOptions?: IExecaOptions
  logger?: ILogger
}
