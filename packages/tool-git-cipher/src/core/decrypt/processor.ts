import type { ICipher } from '@guanghechen/helper-cipher'
import { AesCipherFactory, CipherCatalog, FileCipher } from '@guanghechen/helper-cipher'
import { coverString } from '@guanghechen/helper-option'
import invariant from '@guanghechen/invariant'
import commandExists from 'command-exists'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import { logger } from '../../env/logger'
import { SecretMaster } from '../../util/secret'
import type { IGitCipherDecryptContext } from './context'

export class GitCipherDecryptProcessor {
  protected readonly context: IGitCipherDecryptContext
  protected readonly secretMaster: SecretMaster

  constructor(context: IGitCipherDecryptContext) {
    this.context = context
    this.secretMaster = new SecretMaster({
      cipherFactory: new AesCipherFactory(),
      secretFileEncoding: context.encoding,
      secretContentEncoding: 'hex',
      showAsterisk: context.showAsterisk,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }

  public async decrypt(): Promise<void> {
    const hasGitInstalled: boolean = commandExists.sync('git')
    invariant(hasGitInstalled, '[processor.decrypt] Cannot find git, have you installed it?')

    const { context, secretMaster } = this
    await secretMaster.load(context.secretFilepath)

    const cipher: ICipher | null = secretMaster.cipher
    invariant(cipher != null, '[processor.decrypt] Secret cipher is not available!')

    const fileCipher = new FileCipher({ cipher, logger })
    const catalog = new CipherCatalog({
      fileCipher,
      sourceRootDir: context.plaintextRootDir,
      targetRootDir: context.ciphertextRootDir,
      maxTargetFileSize: context.maxTargetFileSize,
    })
    await catalog.loadFromFile(context.indexFilepath)

    // decrypt files
    const outRootDir = coverString(context.plaintextRootDir, context.outDir)

    const { shouldEmptyOutDir } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldEmptyOutDir',
        default: false,
        message: `Empty ${outRootDir}`,
      },
    ])
    if (shouldEmptyOutDir) {
      logger.info('Emptying {}...', outRootDir)
      await fs.emptyDir(outRootDir)
    }

    await catalog.decryptAll(outRootDir)
  }
}
