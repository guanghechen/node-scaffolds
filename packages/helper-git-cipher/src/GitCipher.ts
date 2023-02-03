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
  multilineMessagePrefix?: string
}

export interface IGitCipherEncryptParams {
  catalog: IFileCipherCatalog
  pathResolver: FileCipherPathResolver
}

export interface IGitCipherDecryptParams {
  pathResolver: FileCipherPathResolver
}

export class GitCipher {
  public readonly cipherBatcher: IFileCipherBatcher
  public readonly configKeeper: IJsonConfigKeeper<IGitCipherConfigData>
  public readonly logger?: ILogger
  public readonly multilineMessagePrefix?: string

  constructor(props: IGitCipherProps) {
    this.cipherBatcher = props.cipherBatcher
    this.configKeeper = props.configKeeper
    this.logger = props.logger
    this.multilineMessagePrefix = props.multilineMessagePrefix
  }

  public async encrypt(params: IGitCipherEncryptParams): Promise<void> {
    const { cipherBatcher, configKeeper, logger, multilineMessagePrefix } = this
    await encryptGitRepo({
      pathResolver: params.pathResolver,
      catalog: params.catalog,
      cipherBatcher,
      configKeeper,
      logger,
      multilineMessagePrefix,
    })
  }

  public async decrypt(params: IGitCipherDecryptParams): Promise<void> {
    const { cipherBatcher, configKeeper, logger, multilineMessagePrefix } = this
    await decryptGitRepo({
      pathResolver: params.pathResolver,
      cipherBatcher,
      configKeeper,
      logger,
      multilineMessagePrefix,
    })
  }
}
