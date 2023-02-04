import { AesCipherFactory } from '@guanghechen/helper-cipher'
import { hasGitInstalled, installDependencies } from '@guanghechen/helper-commander'
import { mkdirsIfNotExists } from '@guanghechen/helper-fs'
import { initGitRepo, stageAll } from '@guanghechen/helper-git'
import { isNonBlankString } from '@guanghechen/helper-is'
import { absoluteOfWorkspace, relativeOfWorkspace } from '@guanghechen/helper-path'
import { runPlop } from '@guanghechen/helper-plop'
import { toLowerCase } from '@guanghechen/helper-string'
import invariant from '@guanghechen/invariant'
import { execa } from 'execa'
import inquirer from 'inquirer'
import nodePlop from 'node-plop'
import { COMMAND_VERSION } from '../../env/constant'
import { logger } from '../../env/logger'
import { resolveTemplateFilepath } from '../../env/util'
import { SecretMaster } from '../../util/secret'
import type { IGitCipherInitContext } from './context'

export class GitCipherInitProcessor {
  protected readonly context: IGitCipherInitContext
  protected secretMaster: SecretMaster

  constructor(context: IGitCipherInitContext) {
    this.context = context
    this.secretMaster = new SecretMaster({
      cipherFactory: new AesCipherFactory(),
      pbkdf2Options: context.pbkdf2Options,
      secretContentEncoding: 'hex',
      showAsterisk: context.showAsterisk,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }

  public async init(): Promise<void> {
    invariant(hasGitInstalled(), `Cannot find 'git', please install it before continuing.`)

    const { context } = this
    logger.debug('context:', context)

    // Render templates.
    await this._renderTemplates()

    // Create secret file.
    await this._createSecretFile()

    // Install dependencies.
    await installDependencies({ stdio: 'inherit', cwd: context.workspace }, [], logger)

    // Init git repo.
    await initGitRepo({
      cwd: context.workspace,
      logger,
      gpgSign: false,
      eol: 'lf',
      encoding: 'utf-8',
    })
    await stageAll({ cwd: context.workspace, logger })
  }

  // Render templates
  protected async _renderTemplates(): Promise<void> {
    const { context } = this

    // request repository url
    let { plainRepoUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'plainRepoUrl',
        message: 'Resource git repository url?',
        filter: x => toLowerCase(x).trim(),
        transformer: (x: string) => toLowerCase(x).trim(),
      },
    ])

    // resolve plainRepoUrl
    if (isNonBlankString(plainRepoUrl)) {
      if (/^[.]/.test(plainRepoUrl)) {
        plainRepoUrl = absoluteOfWorkspace(context.workspace, plainRepoUrl)
      }
    }
    logger.debug('plainRepoUrl:', plainRepoUrl)

    // clone plaintext repository
    if (isNonBlankString(plainRepoUrl)) await this._cloneFromRemote(plainRepoUrl)

    const templateConfig = resolveTemplateFilepath('plop.mjs')
    const plop = await nodePlop(templateConfig, {
      force: false,
      destBasePath: context.workspace,
    })

    const error = await runPlop(plop, undefined, {
      workspace: context.workspace,
      templateVersion: COMMAND_VERSION,
      encoding: context.encoding,
      logLevel: logger.level,
      plainRepoUrl,
      secretSalt: context.pbkdf2Options.salt,
      secretFilepath: relativeOfWorkspace(context.workspace, context.secretFilepath),
      catalogFilepath: relativeOfWorkspace(context.workspace, context.catalogFilepath),
      plainRootDir: relativeOfWorkspace(context.workspace, context.plainRootDir),
      cryptRootDir: relativeOfWorkspace(context.workspace, context.cryptRootDir),
      encryptedFilesDir: context.encryptedFilesDir,
      encryptedFilePathSalt: null,
      showAsterisk: context.showAsterisk,
      minPasswordLength: context.minPasswordLength,
      partCodePrefix: context.partCodePrefix,
    })
    if (error) logger.error(error)
  }

  // Create secret file
  protected async _createSecretFile(): Promise<void> {
    const { context } = this
    const oldSecretMaster = this.secretMaster
    this.secretMaster = await oldSecretMaster.recreate()
    oldSecretMaster.cleanup()
    await this.secretMaster.save(context.secretFilepath)
  }

  /**
   * Clone from remote plaintext repository
   * @param plainRepoUrl  url of remote source repository
   */
  protected async _cloneFromRemote(plainRepoUrl: string): Promise<void> {
    const { context } = this
    mkdirsIfNotExists(context.plainRootDir, true, logger)
    await execa('git', ['clone', plainRepoUrl, context.plainRootDir], {
      stdio: 'inherit',
      cwd: context.plainRootDir,
    })
  }
}
