import type {
  FileCipherPathResolver,
  IFileCipherBatcher,
  IFileCipherCatalog,
  IJsonConfigKeeper,
} from '@guanghechen/helper-cipher-file'
import type { ILogger } from '@guanghechen/utility-types'
import { decryptGitRepo } from './decrypt/repo'
import { encryptGitRepo } from './encrypt/repo'
import type { IGitCipherConfigData } from './types'

export interface IGitCipherProps {
  cipherBatcher: IFileCipherBatcher
  configKeeper: IJsonConfigKeeper<IGitCipherConfigData>
  logger?: ILogger
}

export interface IGitCipherEncryptParams {
  catalog: IFileCipherCatalog
  pathResolver: FileCipherPathResolver
  crypt2plainIdMap: ReadonlyMap<string, string>
}

export interface IGitCipherEncryptRepoResult {
  crypt2plainIdMap: Map<string, string>
}

export interface IGitCipherDecryptParams {
  pathResolver: FileCipherPathResolver
  crypt2plainIdMap: ReadonlyMap<string, string>
}

export interface IGitCipherDecryptRepoResult {
  crypt2plainIdMap: Map<string, string>
}

export class GitCipher {
  public readonly cipherBatcher: IFileCipherBatcher
  public readonly configKeeper: IJsonConfigKeeper<IGitCipherConfigData>
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
      logger,
    })
    return { crypt2plainIdMap }
  }
}
