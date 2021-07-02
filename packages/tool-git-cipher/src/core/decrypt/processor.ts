import type { CipherHelper } from '@guanghechen/cipher-helper'
import { AESCipherHelper } from '@guanghechen/cipher-helper'
import {
  absoluteOfWorkspace,
  relativeOfWorkspace,
} from '@guanghechen/commander-helper'
import { coverString } from '@guanghechen/option-helper'
import commandExists from 'command-exists'
import { logger } from '../../env/logger'
import { WorkspaceCatalog } from '../../util/catalog'
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
    const catalog = new WorkspaceCatalog({
      cipher,
      indexFileEncoding: context.indexFileEncoding,
      indexContentEncoding: 'base64',
      plaintextRootDir: context.plaintextRootDir,
      ciphertextRootDir: context.ciphertextRootDir,
    })
    await catalog.load(context.indexFilepath)

    // decrypt files
    const outRootDir = coverString(context.plaintextRootDir, context.outDir)
    await this.decryptFiles(cipher, catalog, outRootDir)
  }

  /**
   * Decrypt specified files
   *
   * @param cipher
   * @param catalog
   * @param ciphertextFilepaths
   */
  protected async decryptFiles(
    cipher: CipherHelper,
    catalog: WorkspaceCatalog,
    outRootDir: string,
  ): Promise<void> {
    const { context } = this

    const tasks: Array<Promise<void>> = []
    for (const item of catalog.items) {
      const absoluteCiphertextFilepath =
        catalog.resolveAbsoluteCiphertextFilepath(item.ciphertextFilepath)
      const absolutePlaintextFilepath = absoluteOfWorkspace(
        outRootDir,
        item.plaintextFilepath,
      )

      const from = relativeOfWorkspace(
        context.workspace,
        absoluteCiphertextFilepath,
      )
      const to = relativeOfWorkspace(
        context.workspace,
        absolutePlaintextFilepath,
      )

      const task = cipher.decryptFile(
        absoluteCiphertextFilepath,
        absolutePlaintextFilepath,
      )
      task
        .then(() => {
          logger.verbose('[decryptFiles] decrypted ({}) --> ({})', from, to)
        })
        .catch(error => {
          logger.error(
            '[decryptFiles] failed: decrypting ({}) --> ({})',
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
