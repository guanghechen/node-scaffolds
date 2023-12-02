import { decryptFilesOnly } from './decrypt/filesOnly'
import { decryptGitRepo } from './decrypt/repo'
import { encryptGitRepo } from './encrypt/repo'
import type { IGitCipherContext } from './types'
import { verifyGitCommit } from './verify/commit'

export interface IGitCipherProps {
  readonly context: IGitCipherContext
}

export interface IGitCipherEncryptParams {
  readonly crypt2plainIdMap: ReadonlyMap<string, string>
}

export interface IGitCipherDecryptFilesOnlyParams {
  readonly cryptCommitId: string
  readonly filesOnly: string[] | undefined // If empty or undefined, then decrypt all files.
}

export interface IGitCipherDecryptParams {
  readonly crypt2plainIdMap: ReadonlyMap<string, string>
  readonly gpgSign: boolean | undefined
}

export interface IGitCipherVerifyParams {
  readonly cryptCommitId: string
  readonly plainCommitId: string
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
    const { crypt2plainIdMap } = params
    const result = await encryptGitRepo({ context, crypt2plainIdMap })
    return { crypt2plainIdMap: result.crypt2plainIdMap }
  }

  public async decrypt(params: IGitCipherDecryptParams): Promise<IGitCipherDecryptRepoResult> {
    const { context } = this
    const { crypt2plainIdMap, gpgSign } = params
    const result = await decryptGitRepo({ context, crypt2plainIdMap, gpgSign })
    return { crypt2plainIdMap: result.crypt2plainIdMap }
  }

  public async decryptFilesOnly(params: IGitCipherDecryptFilesOnlyParams): Promise<void> {
    const { context } = this
    const { cryptCommitId, filesOnly } = params
    await decryptFilesOnly({ context, cryptCommitId, filesOnly })
  }

  public async verifyCommit(params: IGitCipherVerifyParams): Promise<void | never> {
    const { context } = this
    const { cryptCommitId, plainCommitId } = params
    await verifyGitCommit({
      catalog: context.catalog,
      configKeeper: context.configKeeper,
      cryptCommitId,
      reporter: context.reporter,
      plainCommitId,
    })
  }
}
