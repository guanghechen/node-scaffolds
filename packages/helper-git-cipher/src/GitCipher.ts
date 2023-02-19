import type {
  FileCipherPathResolver,
  IFileCipherBatcher,
  IFileCipherCatalog,
} from '@guanghechen/helper-cipher-file'
import type { IConfigKeeper } from '@guanghechen/helper-config'
import type { ILogger } from '@guanghechen/utility-types'
import { decryptFilesOnly } from './decrypt/filesOnly'
import { decryptGitRepo } from './decrypt/repo'
import { encryptGitRepo } from './encrypt/repo'
import type { IGitCipherConfig } from './types'

export interface IGitCipherProps {
  cipherBatcher: IFileCipherBatcher
  configKeeper: IConfigKeeper<IGitCipherConfig>
  logger?: ILogger
}

export interface IGitCipherEncryptParams {
  catalog: IFileCipherCatalog
  pathResolver: FileCipherPathResolver
  crypt2plainIdMap: ReadonlyMap<string, string>
  getDynamicIv(infos: ReadonlyArray<Buffer>): Readonly<Buffer>
}

export interface IGitCipherDecryptFilesOnlyParams {
  catalog: IFileCipherCatalog
  pathResolver: FileCipherPathResolver
  cryptCommitId: string
  getDynamicIv(infos: ReadonlyArray<Buffer>): Readonly<Buffer>
}

export interface IGitCipherEncryptRepoResult {
  crypt2plainIdMap: Map<string, string>
}

export interface IGitCipherDecryptParams {
  pathResolver: FileCipherPathResolver
  crypt2plainIdMap: ReadonlyMap<string, string>
  gpgSign?: boolean
}

export interface IGitCipherDecryptRepoResult {
  crypt2plainIdMap: Map<string, string>
}

export class GitCipher {
  public readonly cipherBatcher: IFileCipherBatcher
  public readonly configKeeper: IConfigKeeper<IGitCipherConfig>
  public readonly logger?: ILogger

  constructor(props: IGitCipherProps) {
    this.cipherBatcher = props.cipherBatcher
    this.configKeeper = props.configKeeper
    this.logger = props.logger
  }

  public async encrypt(params: IGitCipherEncryptParams): Promise<IGitCipherEncryptRepoResult> {
    const { cipherBatcher, configKeeper, logger } = this
    const { crypt2plainIdMap } = await encryptGitRepo({
      pathResolver: params.pathResolver,
      catalog: params.catalog,
      cipherBatcher,
      configKeeper,
      crypt2plainIdMap: params.crypt2plainIdMap,
      logger,
      getDynamicIv: params.getDynamicIv,
    })
    return { crypt2plainIdMap }
  }

  public async decrypt(params: IGitCipherDecryptParams): Promise<IGitCipherDecryptRepoResult> {
    const { cipherBatcher, configKeeper, logger } = this
    const { crypt2plainIdMap } = await decryptGitRepo({
      pathResolver: params.pathResolver,
      cipherBatcher,
      configKeeper,
      crypt2plainIdMap: params.crypt2plainIdMap,
      gpgSign: params.gpgSign,
      logger,
    })
    return { crypt2plainIdMap }
  }

  public async decryptFilesOnly(params: IGitCipherDecryptFilesOnlyParams): Promise<void> {
    const { cipherBatcher, configKeeper, logger } = this
    await decryptFilesOnly({
      catalog: params.catalog,
      cryptCommitId: params.cryptCommitId,
      pathResolver: params.pathResolver,
      cipherBatcher,
      configKeeper,
      logger,
      getDynamicIv: params.getDynamicIv,
    })
  }
}
