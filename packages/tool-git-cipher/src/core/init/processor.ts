import {
  absoluteOfWorkspace,
  createInitialCommit,
  installDependencies,
  mkdirsIfNotExists,
  relativeOfWorkspace,
} from '@guanghechen/commander-helper'
import { isNonBlankString, toLowerCase } from '@guanghechen/option-helper'
import { runPlop } from '@guanghechen/plop-helper'
import commandExists from 'command-exists'
import execa from 'execa'
import inquirer from 'inquirer'
import nodePlop from 'node-plop'
import { packageVersion } from '../../env/constant'
import { logger } from '../../env/logger'
import { resolveTemplateFilepath } from '../../env/util'
import { WorkspaceCatalog } from '../../util/catalog'
import type { Cipher } from '../../util/cipher'
import { AESCipher } from '../../util/cipher'
import { SecretMaster } from '../../util/secret'
import type { GitCipherInitContext } from './context'

export class GitCipherInitProcessor {
  protected readonly context: GitCipherInitContext
  protected secretMaster: SecretMaster

  constructor(context: GitCipherInitContext) {
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

  public async init(): Promise<void> {
    const { context } = this
    const hasGitInstalled: boolean = commandExists.sync('git')
    if (!hasGitInstalled) {
      throw new Error('Cannot find git, have you installed it?')
    }

    // render templates
    await this.renderTemplates()

    // create secret  file
    await this.createSecretFile()

    // create index file
    await this.createIndexFile()

    // install dependencies
    await installDependencies(
      {
        stdio: 'inherit',
        cwd: context.workspace,
      },
      [],
      logger,
    )

    // create initial commit
    await createInitialCommit(
      {
        stdio: 'inherit',
        cwd: context.workspace,
      },
      [],
      logger,
    )
  }

  /**
   * Render templates
   */
  protected async renderTemplates(): Promise<void> {
    const { context } = this

    // request repository url
    let { plaintextRepositoryUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'plaintextRepositoryUrl',
        message: 'Resource git repository url?',
        filter: x => toLowerCase(x).trim(),
        transformer: (x: string) => toLowerCase(x).trim(),
      },
    ])

    // resolve plaintextRepositoryUrl
    if (isNonBlankString(plaintextRepositoryUrl)) {
      if (/^[.]/.test(plaintextRepositoryUrl)) {
        plaintextRepositoryUrl = absoluteOfWorkspace(
          context.workspace,
          plaintextRepositoryUrl,
        )
      }
    }
    logger.debug('plaintextRepositoryUrl:', plaintextRepositoryUrl)

    // clone plaintext repository
    if (isNonBlankString(plaintextRepositoryUrl)) {
      await this.cloneFromRemote(plaintextRepositoryUrl)
    }

    const templateConfig = resolveTemplateFilepath('plop.js')
    const plop = nodePlop(templateConfig, {
      force: false,
      destBasePath: context.workspace,
    })

    const error = await runPlop(plop, undefined, {
      workspace: context.workspace,
      templateVersion: packageVersion,
      encoding: context.encoding,
      secretFilepath: relativeOfWorkspace(
        context.workspace,
        context.secretFilepath,
      ),
      secretFileEncoding: context.secretFileEncoding,
      indexFilepath: relativeOfWorkspace(
        context.workspace,
        context.indexFilepath,
      ),
      indexFileEncoding: context.indexFileEncoding,
      ciphertextRootDir: relativeOfWorkspace(
        context.workspace,
        context.ciphertextRootDir,
      ),
      plaintextRootDir: relativeOfWorkspace(
        context.workspace,
        context.plaintextRootDir,
      ),
      plaintextRepositoryUrl,
      showAsterisk: context.showAsterisk,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })

    if (error != null) logger.error(error)
  }

  /**
   * Create secret file
   */
  protected async createSecretFile(): Promise<void> {
    const { context } = this
    const oldSecretMaster = this.secretMaster
    this.secretMaster = await oldSecretMaster.recreate()
    oldSecretMaster.cleanup()
    await this.secretMaster.save(context.secretFilepath)
  }

  /**
   * Create index file
   */
  protected async createIndexFile(): Promise<void> {
    const { context, secretMaster } = this
    const cipher: Cipher = secretMaster.getCipher()
    const catalog = new WorkspaceCatalog({
      cipher,
      indexFileEncoding: context.indexFileEncoding,
      indexContentEncoding: 'base64',
      plaintextRootDir: context.plaintextRootDir,
      ciphertextRootDir: context.ciphertextRootDir,
    })
    await catalog.save(context.indexFilepath)
  }

  /**
   * Clone from remote plaintext repository
   * @param plaintextRepositoryUrl  url of remote source repository
   */
  protected async cloneFromRemote(
    plaintextRepositoryUrl: string,
  ): Promise<void> {
    const { context } = this

    mkdirsIfNotExists(context.plaintextRootDir, true, logger)
    await execa(
      'git',
      ['clone', plaintextRepositoryUrl, context.plaintextRootDir],
      {
        stdio: 'inherit',
        cwd: context.plaintextRootDir,
      },
    )
  }
}
