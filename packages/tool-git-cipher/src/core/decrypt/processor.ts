import type { CipherHelper } from '@guanghechen/cipher-helper'
import { AESCipherHelper, CipherCatalog } from '@guanghechen/cipher-helper'
import { coverString } from '@guanghechen/option-helper'
import commandExists from 'command-exists'
import { SecretMaster } from '../../util/secret'
import type { GitCipherDecryptContext } from './context'

export class GitCipherDecryptProcessor {
  protected readonly context: GitCipherDecryptContext
  protected readonly secretMaster: SecretMaster

  constructor(context: GitCipherDecryptContext) {
    this.context = context
    this.secretMaster = new SecretMaster({
      cipherHelperCreator: { create: () => new AESCipherHelper() },
      secretFileEncoding: context.secretFileEncoding,
      secretContentEncoding: 'hex',
      showAsterisk: context.showAsterisk,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }

  public async decrypt(): Promise<void> {
    const hasGitInstalled: boolean = commandExists.sync('git')
    if (!hasGitInstalled) {
      throw new Error('Cannot find git, have you installed it?')
    }

    const { context, secretMaster } = this
    await secretMaster.load(context.secretFilepath)

    const cipher: CipherHelper = secretMaster.getCipher()
    const catalog = new CipherCatalog({
      cipher,
      sourceRootDir: context.plaintextRootDir,
      targetRootDir: context.ciphertextRootDir,
      maxTargetFileSize: context.maxTargetFileSize,
    })
    await catalog.loadFromFile(context.indexFilepath)

    // decrypt files
    const outRootDir = coverString(context.plaintextRootDir, context.outDir)
    await catalog.decryptAll(outRootDir)
  }
}
