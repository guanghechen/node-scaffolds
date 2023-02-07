import type { ICipher } from '@guanghechen/helper-cipher'
import { AesCipherFactory } from '@guanghechen/helper-cipher'
import {
  FileCipher,
  FileCipherBatcher,
  FileCipherCatalog,
  FileCipherPathResolver,
} from '@guanghechen/helper-cipher-file'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { BigFileHelper } from '@guanghechen/helper-file'
import { GitCipher, GitCipherConfig } from '@guanghechen/helper-git-cipher'
import invariant from '@guanghechen/invariant'
import micromatch from 'micromatch'
import { logger } from '../../env/logger'
import { SecretMaster } from '../../util/secret'
import type { IGitCipherEncryptContext } from './context'

export class GitCipherEncryptProcessor {
  protected readonly context: IGitCipherEncryptContext
  protected readonly secretMaster: SecretMaster

  constructor(context: IGitCipherEncryptContext) {
    this.context = context
    this.secretMaster = new SecretMaster({
      cipherFactory: new AesCipherFactory(),
      pbkdf2Options: context.pbkdf2Options,
      secretContentEncoding: 'hex',
      showAsterisk: context.showAsterisk,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })

    logger.debug('context:', context)
  }

  public async encrypt(): Promise<void> {
    invariant(hasGitInstalled(), '[processor.encrypt] Cannot find git, have you installed it?')

    const { context, secretMaster } = this
    logger.debug('context:', context)

    await secretMaster.load(context.secretFilepath)

    const cipher: ICipher | null = secretMaster.cipher
    invariant(cipher != null, '[processor.encrypt] Secret cipher is not available!')

    const fileCipher = new FileCipher({ cipher, logger })
    const fileHelper = new BigFileHelper({ partCodePrefix: context.partCodePrefix })
    const configKeeper = new GitCipherConfig({ cipher, filepath: context.catalogFilepath })
    const cipherBatcher = new FileCipherBatcher({
      fileCipher,
      fileHelper,
      maxTargetFileSize: context.maxTargetFileSize,
      logger,
    })
    const gitCipher = new GitCipher({ cipherBatcher, configKeeper, logger })

    // encrypt files
    const pathResolver = new FileCipherPathResolver({
      plainRootDir: context.plainRootDir,
      cryptRootDir: context.cryptRootDir,
    })
    const catalog = new FileCipherCatalog({
      pathResolver,
      maxTargetFileSize: context.maxTargetFileSize,
      partCodePrefix: context.partCodePrefix,
      encryptedFilesDir: context.encryptedFilesDir,
      encryptedFilePathSalt: context.encryptedFilePathSalt,
      logger,
      isKeepPlain:
        context.keepPlainPatterns.length > 0
          ? sourceFile => micromatch.isMatch(sourceFile, context.keepPlainPatterns, { dot: true })
          : () => false,
    })
    await gitCipher.encrypt({ pathResolver, catalog })
  }
}
