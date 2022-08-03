import type { ICipher } from '@guanghechen/helper-cipher'
import { AESCipher, CipherCatalog } from '@guanghechen/helper-cipher'
import { coverString } from '@guanghechen/helper-option'
import commandExists from 'command-exists'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import { logger } from '../../env/logger'
import { SecretMaster } from '../../util/secret'
import type { GitCipherDecryptContext } from './context'

export class GitCipherDecryptProcessor {
  protected readonly context: GitCipherDecryptContext
  protected readonly secretMaster: SecretMaster

  constructor(context: GitCipherDecryptContext) {
    this.context = context
    this.secretMaster = new SecretMaster({
      cipherHelperCreator: { create: () => new AESCipher() },
      secretFileEncoding: context.encoding,
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

    const cipher: ICipher = secretMaster.getCipher()
    const catalog = new CipherCatalog({
      cipher,
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
