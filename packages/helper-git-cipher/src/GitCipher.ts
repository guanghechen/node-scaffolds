import type { FilepathResolver } from '@guanghechen/helper-path'
import { decryptFilesOnly } from './decrypt/filesOnly'
import { decryptGitRepo } from './decrypt/repo'
import { encryptGitRepo } from './encrypt/repo'
import type { IGitCipherContext } from './GitCipherContext'
import { verifyGitCommit } from './verify/commit'

export interface IGitCipherProps {
  readonly context: IGitCipherContext
}

export interface IGitCipherEncryptParams {
  readonly crypt2plainIdMap: ReadonlyMap<string, string>
  readonly cryptPathResolver: FilepathResolver
  readonly plainPathResolver: FilepathResolver
}

export interface IGitCipherDecryptFilesOnlyParams {
  readonly cryptCommitId: string
  readonly cryptPathResolver: FilepathResolver
  readonly filesOnly: string[] | undefined // If empty or undefined, then decrypt all files.
  readonly plainPathResolver: FilepathResolver
}

export interface IGitCipherDecryptParams {
  readonly crypt2plainIdMap: ReadonlyMap<string, string>
  readonly cryptPathResolver: FilepathResolver
  readonly gpgSign: boolean | undefined
  readonly plainPathResolver: FilepathResolver
}

export interface IGitCipherVerifyParams {
  readonly cryptCommitId: string
  readonly cryptPathResolver: FilepathResolver
  readonly plainCommitId: string
  readonly plainPathResolver: FilepathResolver
}

export interface IGitCipherEncryptRepoResult {
  readonly crypt2plainIdMap: Map<string, string>
}

export interface IGitCipherDecryptRepoResult {
  readonly crypt2plainIdMap: Map<string, string>
}

export class GitCipher {
  public readonly context: IGitCipherContext

  constructor(props: IGitCipherProps) {
    this.context = props.context
  }

  public async encrypt(params: IGitCipherEncryptParams): Promise<IGitCipherEncryptRepoResult> {
    const { context } = this
    const { cryptPathResolver, crypt2plainIdMap, plainPathResolver } = params
    const result = await encryptGitRepo({
      context,
      crypt2plainIdMap,
      cryptPathResolver,
      plainPathResolver,
    })
    return { crypt2plainIdMap: result.crypt2plainIdMap }
  }

  public async decrypt(params: IGitCipherDecryptParams): Promise<IGitCipherDecryptRepoResult> {
    const { context } = this
    const { cryptPathResolver, crypt2plainIdMap, gpgSign, plainPathResolver } = params
    const result = await decryptGitRepo({
      context,
      crypt2plainIdMap,
      cryptPathResolver,
      gpgSign,
      plainPathResolver,
    })
    return { crypt2plainIdMap: result.crypt2plainIdMap }
  }

  public async decryptFilesOnly(params: IGitCipherDecryptFilesOnlyParams): Promise<void> {
    const { context } = this
    const { cryptCommitId, cryptPathResolver, plainPathResolver, filesOnly } = params
    await decryptFilesOnly({
      context,
      cryptCommitId,
      cryptPathResolver,
      filesOnly,
      plainPathResolver,
    })
  }

  public async verifyCommit(params: IGitCipherVerifyParams): Promise<void | never> {
    const { context } = this
    const { cryptCommitId, cryptPathResolver, plainCommitId, plainPathResolver } = params
    await verifyGitCommit({
      catalogContext: context.catalogContext,
      configKeeper: context.configKeeper,
      cryptCommitId,
      cryptPathResolver,
      logger: context.logger,
      plainCommitId,
      plainPathResolver,
    })
  }
}
