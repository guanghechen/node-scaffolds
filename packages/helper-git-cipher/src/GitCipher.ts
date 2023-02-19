import type { IFileCipherBatcher, IFileCipherCatalog } from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import type { FilepathResolver } from '@guanghechen/helper-path'
import type { ILogger } from '@guanghechen/utility-types'
import { decryptFilesOnly } from './decrypt/filesOnly'
import { decryptGitRepo } from './decrypt/repo'
import { encryptGitRepo } from './encrypt/repo'
import type { IGitCipherConfig } from './types'

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
}

export interface IGitCipherDecryptParams {
  cryptPathResolver: FilepathResolver
  crypt2plainIdMap: ReadonlyMap<string, string>
  gpgSign?: boolean
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
    const { catalog, cipherBatcher, configKeeper, logger } = this
    const { crypt2plainIdMap } = await encryptGitRepo({
      catalog,
      cipherBatcher,
      configKeeper,
      cryptPathResolver: params.cryptPathResolver,
      crypt2plainIdMap: params.crypt2plainIdMap,
      logger,
      plainPathResolver: params.plainPathResolver,
      getDynamicIv: this.#getDynamicIv,
    })
    return { crypt2plainIdMap }
  }

  public async decrypt(params: IGitCipherDecryptParams): Promise<IGitCipherDecryptRepoResult> {
    const { catalog, cipherBatcher, configKeeper, logger } = this
    const { crypt2plainIdMap } = await decryptGitRepo({
      catalog,
      cipherBatcher,
      configKeeper,
      cryptPathResolver: params.cryptPathResolver,
      crypt2plainIdMap: params.crypt2plainIdMap,
      gpgSign: params.gpgSign,
      logger,
      plainPathResolver: params.plainPathResolver,
      getDynamicIv: this.#getDynamicIv,
    })
    return { crypt2plainIdMap }
  }

  public async decryptFilesOnly(params: IGitCipherDecryptFilesOnlyParams): Promise<void> {
    const { catalog, cipherBatcher, configKeeper, logger } = this
    await decryptFilesOnly({
      catalog,
      cipherBatcher,
      cryptCommitId: params.cryptCommitId,
      cryptPathResolver: params.cryptPathResolver,
      configKeeper,
      logger,
      plainPathResolver: params.plainPathResolver,
      getDynamicIv: this.#getDynamicIv,
    })
  }
}
