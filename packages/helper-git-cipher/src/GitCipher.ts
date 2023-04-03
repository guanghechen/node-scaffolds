import type { IFileCipherBatcher, IFileCipherCatalog } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import type { FilepathResolver } from '@guanghechen/helper-path'
import type { ILogger } from '@guanghechen/utility-types'
import { decryptFilesOnly } from './decrypt/filesOnly'
import { decryptGitRepo } from './decrypt/repo'
import { encryptGitRepo } from './encrypt/repo'
import type { IGitCipherConfig } from './types'
import { verifyGitCommit } from './verify/commit'

export interface IGitCipherProps {
  catalog: IFileCipherCatalog
  cipherBatcher: IFileCipherBatcher
  configKeeper: IConfigKeeper<IGitCipherConfig>
  logger: ILogger | undefined
  getDynamicIv(infos: ReadonlyArray<Buffer>): Readonly<Buffer>
}

export interface IGitCipherEncryptParams {
  cryptPathResolver: FilepathResolver
  crypt2plainIdMap: ReadonlyMap<string, string>
  plainPathResolver: FilepathResolver
}

export interface IGitCipherDecryptFilesOnlyParams {
  cryptCommitId: string
  cryptPathResolver: FilepathResolver
  plainPathResolver: FilepathResolver
  filesOnly?: string[] | undefined // If empty or undefined, then decrypt all files.
}

export interface IGitCipherDecryptParams {
  cryptPathResolver: FilepathResolver
  crypt2plainIdMap: ReadonlyMap<string, string>
  gpgSign?: boolean
  plainPathResolver: FilepathResolver
}

export interface IGitCipherVerifyParams {
  cryptCommitId: string
  cryptPathResolver: FilepathResolver
  plainCommitId: string
  plainPathResolver: FilepathResolver
}

export interface IGitCipherEncryptRepoResult {
  crypt2plainIdMap: Map<string, string>
}

export interface IGitCipherDecryptRepoResult {
  crypt2plainIdMap: Map<string, string>
}

export class GitCipher {
  public readonly catalog: IFileCipherCatalog
  public readonly cipherBatcher: IFileCipherBatcher
  public readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  public readonly logger: ILogger | undefined
  readonly #getDynamicIv: (infos: ReadonlyArray<Buffer>) => Readonly<Buffer>

  constructor(props: IGitCipherProps) {
    this.catalog = props.catalog
    this.cipherBatcher = props.cipherBatcher
    this.configKeeper = props.configKeeper
    this.logger = props.logger
    this.#getDynamicIv = props.getDynamicIv
  }

  public async encrypt(params: IGitCipherEncryptParams): Promise<IGitCipherEncryptRepoResult> {
    const { cryptPathResolver, crypt2plainIdMap, plainPathResolver } = params
    const { catalog, cipherBatcher, configKeeper, logger } = this
    const result = await encryptGitRepo({
      catalog,
      cipherBatcher,
      configKeeper,
      cryptPathResolver,
      crypt2plainIdMap,
      logger,
      plainPathResolver,
      getDynamicIv: this.#getDynamicIv,
    })
    return { crypt2plainIdMap: result.crypt2plainIdMap }
  }

  public async decrypt(params: IGitCipherDecryptParams): Promise<IGitCipherDecryptRepoResult> {
    const { cryptPathResolver, crypt2plainIdMap, gpgSign, plainPathResolver } = params
    const { catalog, cipherBatcher, configKeeper, logger } = this
    const result = await decryptGitRepo({
      catalogContext: catalog.context,
      cipherBatcher,
      configKeeper,
      cryptPathResolver: cryptPathResolver,
      crypt2plainIdMap,
      gpgSign,
      logger,
      plainPathResolver: plainPathResolver,
      getDynamicIv: this.#getDynamicIv,
    })
    return { crypt2plainIdMap: result.crypt2plainIdMap }
  }

  public async decryptFilesOnly(params: IGitCipherDecryptFilesOnlyParams): Promise<void> {
    const { cryptCommitId, cryptPathResolver, plainPathResolver, filesOnly } = params
    const { catalog, cipherBatcher, configKeeper, logger } = this
    await decryptFilesOnly({
      catalogContext: catalog.context,
      cipherBatcher,
      cryptCommitId,
      cryptPathResolver,
      configKeeper,
      filesOnly,
      logger,
      plainPathResolver,
      getDynamicIv: this.#getDynamicIv,
    })
  }

  public async verifyCommit(params: IGitCipherVerifyParams): Promise<void | never> {
    const { cryptCommitId, cryptPathResolver, plainCommitId, plainPathResolver } = params
    const { catalog, configKeeper, logger } = this
    await verifyGitCommit({
      catalog,
      configKeeper,
      cryptCommitId,
      cryptPathResolver,
      logger,
      plainCommitId,
      plainPathResolver,
    })
  }
}
