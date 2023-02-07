import type { ICipher } from '@guanghechen/helper-cipher'
import { AesCipherFactory } from '@guanghechen/helper-cipher'
import {
  FileCipher,
  FileCipherBatcher,
  FileCipherPathResolver,
} from '@guanghechen/helper-cipher-file'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { BigFileHelper } from '@guanghechen/helper-file'
import { emptyDir } from '@guanghechen/helper-fs'
import { GitCipher, GitCipherConfig, decryptFilesOnly } from '@guanghechen/helper-git-cipher'
import { coverString } from '@guanghechen/helper-option'
import invariant from '@guanghechen/invariant'
import inquirer from 'inquirer'
import { existsSync } from 'node:fs'
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
      pbkdf2Options: context.pbkdf2Options,
      secretContentEncoding: 'hex',
      showAsterisk: context.showAsterisk,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })

    logger.debug('context:', context)
  }

  public async decrypt(): Promise<void> {
    invariant(hasGitInstalled(), '[processor.decrypt] Cannot find git, have you installed it?')

    const { context, secretMaster } = this
    await secretMaster.load(context.secretFilepath)

    const cipher: ICipher | null = secretMaster.cipher
    invariant(cipher != null, '[processor.decrypt] Secret cipher is not available!')

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

    // decrypt files
    const outRootDir = coverString(context.plainRootDir, context.outDir)
    const outPathResolver = new FileCipherPathResolver({
      plainRootDir: outRootDir,
      cryptRootDir: context.cryptRootDir,
    })

    if (existsSync(outPathResolver.plainRootDir)) {
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
        await emptyDir(outRootDir)
      }
    }

    if (context.filesAt) {
      logger.debug('Trying decryptFilesOnly...')
      await decryptFilesOnly({
        cryptCommitId: context.filesAt,
        cipherBatcher,
        pathResolver: outPathResolver,
        configKeeper,
        logger,
      })
    } else {
      logger.debug('Trying decrypt entire repo...')
      await gitCipher.decrypt({ pathResolver: outPathResolver })
    }
  }
}
