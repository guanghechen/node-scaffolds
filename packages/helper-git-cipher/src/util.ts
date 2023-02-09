import type { FileCipherPathResolver } from '@guanghechen/helper-cipher-file'
import type { IGitCommandBaseParams, IGitCommitWithMessage } from '@guanghechen/helper-git'
import { getAllLocalBranches, getCommitWithMessageList, isGitRepo } from '@guanghechen/helper-git'
import type { ILogger } from '@guanghechen/utility-types'
import { createHash } from 'node:crypto'
import type { IGitCommitOverview } from './types'

export const resolveIdMap = async (params: {
  pathResolver: FileCipherPathResolver
  crypt2plainIdMap: ReadonlyMap<string, string>
  logger?: ILogger
}): Promise<{
  crypt2plainIdMap: Map<string, string>
}> => {
  const { pathResolver, logger } = params
  if (!isGitRepo(pathResolver.plainRootDir) || !isGitRepo(pathResolver.cryptRootDir)) {
    return { crypt2plainIdMap: new Map() }
  }

  const crypt2plainIdMap: Map<string, string> = new Map(params.crypt2plainIdMap.entries())

  // Find & remove invalided records from plain repo.
  {
    const plainCmdCtx: IGitCommandBaseParams = { cwd: pathResolver.plainRootDir, logger }
    const plainLocalBranch = await getAllLocalBranches(plainCmdCtx)
    const plainCommitList: IGitCommitWithMessage[] = await getCommitWithMessageList({
      ...plainCmdCtx,
      branchOrCommitIds: plainLocalBranch.branches,
    })
    const plainCommitIdSet: Set<string> = new Set(plainCommitList.map(item => item.id))
    for (const [cryptId, plainId] of params.crypt2plainIdMap.entries()) {
      if (!plainCommitIdSet.has(plainId)) crypt2plainIdMap.delete(cryptId)
    }
  }

  // Find & remove invalided records from crypt repo.
  {
    const cryptCmdCtx: IGitCommandBaseParams = { cwd: pathResolver.cryptRootDir, logger }
    const cryptLocalBranch = await getAllLocalBranches(cryptCmdCtx)
    const cryptCommitList: IGitCommitWithMessage[] = await getCommitWithMessageList({
      ...cryptCmdCtx,
      branchOrCommitIds: cryptLocalBranch.branches,
    })
    const cryptCommitIdSet: Set<string> = new Set(cryptCommitList.map(item => item.id))
    for (const cryptId of params.crypt2plainIdMap.keys()) {
      if (!cryptCommitIdSet.has(cryptId)) crypt2plainIdMap.delete(cryptId)
    }
  }

  return { crypt2plainIdMap }
}

export const generateCommitHash = (commit: IGitCommitOverview): string => {
  const sha256 = createHash('sha256')
  for (const item of commit.catalog.items) {
    sha256.update(item.plainFilepath)
    sha256.update(item.cryptFilepath)
    sha256.update(item.fingerprint)
  }
  sha256.update(commit.signature.authorDate)
  sha256.update(commit.signature.authorName)
  sha256.update(commit.signature.authorEmail)
  sha256.update(commit.signature.committerDate)
  sha256.update(commit.signature.committerName)
  sha256.update(commit.signature.committerEmail)
  for (const parent of commit.parents) sha256.update(parent)
  return sha256.digest().toString('hex')
}
