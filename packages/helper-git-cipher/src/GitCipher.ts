import { decryptFilesOnly } from './decrypt/filesOnly'
import { decryptGitRepo } from './decrypt/repo'
import { encryptGitRepo } from './encrypt/repo'
import type { IGitCipherContext } from './types'
import { verifyGitCommit } from './verify/commit'
import { verifyCryptGitCommit } from './verify/cryptCommit'

export interface IGitCipherProps {
  readonly context: IGitCipherContext
}

export class GitCipher {
  public readonly context: IGitCipherContext

  constructor(props: IGitCipherProps) {
    this.context = props.context
  }

  public async encrypt(params: {
    readonly crypt2plainIdMap: ReadonlyMap<string, string>
  }): Promise<IGitCipherEncryptRepoResult> {
    const { context } = this
    const { crypt2plainIdMap } = params
    const result = await encryptGitRepo({ context, crypt2plainIdMap })
    return { crypt2plainIdMap: result.crypt2plainIdMap }
  }

  public async decrypt(params: {
    readonly crypt2plainIdMap: ReadonlyMap<string, string>
    readonly gpgSign: boolean | undefined
  }): Promise<IGitCipherDecryptRepoResult> {
    const { context } = this
    const { crypt2plainIdMap, gpgSign } = params
    const result = await decryptGitRepo({ context, crypt2plainIdMap, gpgSign })
    return { crypt2plainIdMap: result.crypt2plainIdMap }
  }

  public async decryptFilesOnly(params: {
    readonly cryptCommitId: string
    readonly filesOnly: string[] | undefined // If empty or undefined, then decrypt all files.
  }): Promise<void> {
    const { context } = this
    const { cryptCommitId, filesOnly } = params
    await decryptFilesOnly({ context, cryptCommitId, filesOnly })
  }

  public async verifyCommit(params: {
    readonly cryptCommitId: string
    readonly plainCommitId: string
  }): Promise<void | never> {
    const { cryptCommitId, plainCommitId } = params
    const { catalog, configKeeper, cryptPathResolver, plainPathResolver, reporter } = this.context

    await verifyGitCommit({
      catalog,
      configKeeper,
      cryptCommitId,
      cryptPathResolver,
      plainCommitId,
      plainPathResolver,
      reporter,
    })
  }

  public async verifyCryptCommit(params: {
    readonly catalogConfigPath: string
    readonly cryptCommitId: string
  }): Promise<void | never> {
    const { catalogConfigPath, cryptCommitId } = params
    const { catalog, configKeeper, cryptPathResolver, reporter } = this.context

    await verifyCryptGitCommit({
      catalog,
      catalogConfigPath,
      configKeeper,
      cryptCommitId,
      cryptPathResolver,
      reporter,
    })
  }
}

interface IGitCipherEncryptRepoResult {
  readonly crypt2plainIdMap: Map<string, string>
}

interface IGitCipherDecryptRepoResult {
  readonly crypt2plainIdMap: Map<string, string>
}
