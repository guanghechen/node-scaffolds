import type { FileCipherPathResolver } from '@guanghechen/helper-cipher-file'
import type { IGitCommitWithMessage } from '@guanghechen/helper-git'
import { getCommitWithMessageList } from '@guanghechen/helper-git'
import type { ILogger } from '@guanghechen/utility-types'

export interface IExtractPlain2CryptCommitIdMapParams {
  plainBranches: string[]
  pathResolver: FileCipherPathResolver
  logger?: ILogger
}

/**
 * Extract <plain commit id, crypt commit id> map from crypt repo.
 *
 * @param params
 * @returns
 */
export async function extractPlain2CryptCommitIdMap(
  params: IExtractPlain2CryptCommitIdMapParams,
): Promise<{ plain2cryptIdMap: Map<string, string> }> {
  const { pathResolver, logger, plainBranches } = params
  const plain2cryptIdMap: Map<string, string> = new Map()
  const commitWithMessageList: IGitCommitWithMessage[] = await getCommitWithMessageList({
    branchOrCommitIds: plainBranches,
    cwd: pathResolver.cryptRootDir,
    logger,
  })
  const regex = /^\s*#([\da-f]+)/
  for (const item of commitWithMessageList) {
    const srcCommitId = regex.exec(item.message)![1]
    plain2cryptIdMap.set(srcCommitId, item.id)
  }
  return { plain2cryptIdMap }
}

export interface IExtractCrypt2PlainCommitIdMapParams {
  cryptBranches: string[]
  pathResolver: FileCipherPathResolver
  logger?: ILogger
}

/**
 * Extract <crypt commit id, plain commit id> map from crypt repo.
 *
 * @param params
 * @returns
 */
export async function extractCrypt2PlainCommitIdMap(
  params: IExtractCrypt2PlainCommitIdMapParams,
): Promise<{
  crypt2plainIdMap: Map<string, string>
}> {
  const { pathResolver, logger, cryptBranches } = params
  const crypt2plainIdMap: Map<string, string> = new Map()
  const commitWithMessageList: IGitCommitWithMessage[] = await getCommitWithMessageList({
    branchOrCommitIds: cryptBranches,
    cwd: pathResolver.cryptRootDir,
    logger,
  })
  const regex = /^\s*#([\da-f]+)/
  for (const item of commitWithMessageList) {
    const srcCommitId = regex.exec(item.message)![1]
    crypt2plainIdMap.set(item.id, srcCommitId)
  }
  return { crypt2plainIdMap }
}
