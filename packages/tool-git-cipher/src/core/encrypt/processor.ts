import type { CipherHelper } from '@guanghechen/cipher-helper'
import { AESCipherHelper, CipherCatalog } from '@guanghechen/cipher-helper'
import { createCommitAll } from '@guanghechen/commander-helper'
import { collectAllFilesSync } from '@guanghechen/file-helper'
import commandExists from 'command-exists'
import execa from 'execa'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import path from 'path'
import { logger } from '../../env/logger'
import { SecretMaster } from '../../util/secret'
import type { GitCipherEncryptContext } from './context'

export class GitCipherEncryptProcessor {
  protected readonly context: GitCipherEncryptContext
  protected readonly secretMaster: SecretMaster

  constructor(context: GitCipherEncryptContext) {
    this.context = context
    this.secretMaster = new SecretMaster({
      cipherHelperCreator: { create: () => new AESCipherHelper() },
      secretFileEncoding: context.encoding,
      secretContentEncoding: 'hex',
      showAsterisk: context.showAsterisk,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }

  public async encrypt(): Promise<void> {
    const hasGitInstalled: boolean = commandExists.sync('git')
    if (!hasGitInstalled) {
      throw new Error('Cannot find git, have you installed it?')
    }

    const { context, secretMaster } = this
    logger.debug('context:', context)

    await secretMaster.load(context.secretFilepath)

    const cipher: CipherHelper = secretMaster.getCipher()
    const catalog = new CipherCatalog({
      cipher,
      sourceRootDir: context.plaintextRootDir,
      targetRootDir: context.ciphertextRootDir,
      maxTargetFileSize: context.maxTargetFileSize,
    })

    let commitMessage = ''

    try {
      // fetch from remote source repository
      if (context.updateBeforeEncrypt) {
        await this.fetchFromRemote()
      }

      if (context.full) {
        // full quantity update
        await this.fullQuantityUpdate(catalog)
        commitMessage = 'feat: full quantity update'
      } else {
        // incremental update
        await this.incrementalUpdate(catalog)
        commitMessage = 'feat: incremental update'
      }
    } finally {
      // Sync catalog.
      catalog.touch()
      await catalog.save(context.indexFilepath)

      // Perform cleanup operations.
      cipher.cleanup()
    }

    // do commit
    await createCommitAll(
      {
        stdio: 'inherit',
        cwd: context.workspace,
      },
      commitMessage + ` -- ${new Date().toISOString()}`,
    )
  }

  /**
   * Incremental update
   */
  public async incrementalUpdate(catalog: CipherCatalog): Promise<void> {
    const { context } = this

    // Load from or Create a catalog index file.
    if (fs.existsSync(context.indexFilepath)) {
      await catalog.loadFromFile(context.indexFilepath)
    } else {
      await catalog.save(context.indexFilepath)
    }

    // Remove files that deleted
    catalog.cleanup()

    // Encrypt modified files only.
    const modifiedFilepaths: string[] = collectAllFilesSync(
      path.join(context.plaintextRootDir, '.git'),
      (p, stat) => catalog.isModified(p, stat),
    )
    await this.encryptFiles(catalog, modifiedFilepaths)
  }

  /**
   * Full quantity update
   */
  public async fullQuantityUpdate(catalog: CipherCatalog): Promise<void> {
    const { context } = this

    // Empty ciphertextRootDir and index file.
    const { shouldEmptyOutDir } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldEmptyOutDir',
        default: false,
        message: `Empty ${context.ciphertextRootDir}`,
      },
    ])
    if (shouldEmptyOutDir) {
      logger.info('Emptying {}...', context.ciphertextRootDir)
      await fs.emptyDir(context.ciphertextRootDir)
    }

    // Reset catalog.
    catalog.reset()
    await catalog.save(context.indexFilepath)

    // Encrypt all files.
    const modifiedFilepaths = collectAllFilesSync(
      path.join(context.plaintextRootDir, '.git'),
    )
    await this.encryptFiles(catalog, modifiedFilepaths)
  }

  /**
   * Encrypt specified files
   *
   * @param catalog
   * @param plaintextFilepaths
   */
  protected async encryptFiles(
    catalog: CipherCatalog,
    plaintextFilepaths: string[],
  ): Promise<void> {
    for (const filepath of plaintextFilepaths) {
      logger.debug('encrypt file:', filepath)
      await catalog.register(filepath)
    }
  }

  /**
   * Fetch all branches from all remotes
   */
  protected async fetchFromRemote(): Promise<void> {
    const { context } = this

    await execa('git', ['fetch', '--all'], {
      stdio: 'inherit',
      cwd: context.plaintextRootDir,
    })
  }
}
