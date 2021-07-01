import {
  absoluteOfWorkspace,
  collectAllFilesSync,
  createCommitAll,
  relativeOfWorkspace,
} from '@guanghechen/commander-helper'
import commandExists from 'command-exists'
import execa from 'execa'
import fs from 'fs-extra'
import path from 'path'
import { logger } from '../../env/logger'
import { WorkspaceCatalog } from '../../util/catalog'
import type { Cipher } from '../../util/cipher'
import { AESCipher } from '../../util/cipher'
import { SecretMaster } from '../../util/secret'
import type { GitCipherEncryptContext } from './context'

export class GitCipherEncryptProcessor {
  protected readonly context: GitCipherEncryptContext
  protected readonly secretMaster: SecretMaster

  constructor(context: GitCipherEncryptContext) {
    this.context = context
    this.secretMaster = new SecretMaster({
      cipherFactory: { create: () => new AESCipher() },
      secretFileEncoding: context.secretFileEncoding,
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
    await secretMaster.load(context.secretFilepath)

    const cipher: Cipher = secretMaster.getCipher()
    const catalog = new WorkspaceCatalog({
      cipher,
      indexFileEncoding: context.indexFileEncoding,
      indexContentEncoding: 'base64',
      plaintextRootDir: context.plaintextRootDir,
      ciphertextRootDir: context.ciphertextRootDir,
    })

    let commitMessage = ''

    try {
      // fetch from remote source repository
      if (context.updateBeforeEncrypt) {
        await this.fetchFromRemote()
      }

      if (context.full) {
        // full quantity update
        await this.fullQuantityUpdate(cipher, catalog)
        commitMessage = 'feat: full quantity update'
      } else {
        // incremental update
        await this.incrementalUpdate(cipher, catalog)
        commitMessage = 'feat: incremental update'
      }
    } finally {
      await catalog.save(context.indexFilepath)
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
  public async incrementalUpdate(
    cipher: Cipher,
    catalog: WorkspaceCatalog,
  ): Promise<void> {
    const { context } = this
    await catalog.load(context.indexFilepath)

    const fullPlaintextFilepaths: string[] = collectAllFilesSync(
      path.join(context.plaintextRootDir, '.git'),
      null,
    )

    const modifiedPlaintextFilepaths: string[] = fullPlaintextFilepaths.filter(
      p => !catalog.isNotModified(fs.statSync(p)),
    )

    // remove files that deleted
    await catalog.removeDeletedFiles(fullPlaintextFilepaths)

    // encrypt files
    await this.encryptFiles(cipher, catalog, modifiedPlaintextFilepaths)
  }

  /**
   * Full quantity update
   */
  public async fullQuantityUpdate(
    cipher: Cipher,
    catalog: WorkspaceCatalog,
  ): Promise<void> {
    const { context } = this

    // empty ciphertextRootDir and index file
    logger.verbose('empty directory {}', context.ciphertextRootDir)
    await fs.emptyDir(context.ciphertextRootDir)
    await catalog.save(context.indexFilepath)

    const plaintextFilepaths = collectAllFilesSync(
      path.join(context.plaintextRootDir, '.git'),
      null,
    )

    // encrypt files
    await this.encryptFiles(cipher, catalog, plaintextFilepaths)
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

  /**
   * Encrypt specified files
   *
   * @param cipher
   * @param catalog
   * @param plaintextFilepaths
   */
  protected async encryptFiles(
    cipher: Cipher,
    catalog: WorkspaceCatalog,
    plaintextFilepaths: string[],
  ): Promise<void> {
    if (plaintextFilepaths.length <= 0) return

    const { context } = this
    const tasks: Array<Promise<void>> = []
    for (const plaintextFilepath of plaintextFilepaths) {
      const absolutePlaintextFilepath = absoluteOfWorkspace(
        context.workspace,
        plaintextFilepath,
      )
      const absoluteCiphertextFilepath = catalog.insertOrUpdateItem(
        absolutePlaintextFilepath,
      )

      const from = relativeOfWorkspace(
        context.workspace,
        absolutePlaintextFilepath,
      )
      const to = relativeOfWorkspace(
        context.workspace,
        absoluteCiphertextFilepath,
      )

      const task = cipher.encryptFile(
        absolutePlaintextFilepath,
        absoluteCiphertextFilepath,
      )
      task
        .then(() => {
          logger.verbose('[encryptFiles] encrypted ({}) --> ({})', from, to)
        })
        .catch(error => {
          logger.error(
            '[encryptFiles] failed: encrypting ({}) --> ({})',
            from,
            to,
          )
          throw error
        })
      tasks.push(task)
    }

    await Promise.all(tasks)
  }
}
