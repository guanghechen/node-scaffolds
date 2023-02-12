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
import type { ISecretConfigData, SecretConfigKeeper } from '../../util/SecretConfig'
import { SecretMaster } from '../../util/SecretMaster'
import type { IGitCipherInitContext } from './context'

export class GitCipherInitProcessor {
  protected readonly context: IGitCipherInitContext
  protected secretMaster: SecretMaster

  constructor(context: IGitCipherInitContext) {
    logger.debug('context:', context)

    this.context = context
    this.secretMaster = new SecretMaster({
      showAsterisk: context.showAsterisk,
      maxRetryTimes: context.maxRetryTimes,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }

  public async init(): Promise<void> {
    invariant(hasGitInstalled(), `Cannot find 'git', please install it before continuing.`)

    const { context } = this

    // Create secret file.
    const configKeeper = await this._createSecret()
    await this.secretMaster.load(configKeeper, false)

    // Render boilerplates.
    await this._renderBoilerplates(configKeeper.data!)

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

  // Render boilerplates.
  protected async _renderBoilerplates(secretConfigData: ISecretConfigData): Promise<void> {
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
      bakPlainRootDir: 'ghc-plain-bak',
      catalogFilepath: relativeOfWorkspace(context.workspace, context.catalogFilepath),
      cryptFilepathSalt: context.cryptFilepathSalt,
      cryptFilesDir: relativeOfWorkspace(context.cryptRootDir, context.cryptFilesDir),
      cryptRootDir: relativeOfWorkspace(context.workspace, context.cryptRootDir),
      encoding: context.encoding,
      logLevel: logger.level,
      mainIvSize: context.mainIvSize,
      mainKeySize: context.mainKeySize,
      maxPasswordLength: context.maxPasswordLength,
      minPasswordLength: context.minPasswordLength,
      partCodePrefix: context.partCodePrefix,
      pbkdf2Options: context.pbkdf2Options,
      plainRootDir: relativeOfWorkspace(context.workspace, context.plainRootDir),
      secret: secretConfigData.secret,
      secretAuthTag: secretConfigData.secretAuthTag,
      secretFilepath: relativeOfWorkspace(context.workspace, context.secretFilepath),
      secretIvSize: context.secretIvSize,
      secretKeySize: context.secretKeySize,
      showAsterisk: context.showAsterisk,
      workspace: context.workspace,
      templateVersion: COMMAND_VERSION,
      plainRepoUrl,
    })
    if (error) logger.error(error)
  }

  // Create secret file
  protected async _createSecret(): Promise<SecretConfigKeeper> {
    const { context, secretMaster } = this
    const configKeeper = await secretMaster.createSecret(
      context.secretFilepath,
      context.cryptRootDir,
      {
        catalogFilepath: context.catalogFilepath,
        cryptFilepathSalt: context.cryptFilepathSalt,
        cryptFilesDir: context.cryptFilesDir,
        keepPlainPatterns: context.keepPlainPatterns,
        mainIvSize: context.mainIvSize,
        mainKeySize: context.mainKeySize,
        maxTargetFileSize:
          context.maxTargetFileSize > Number.MAX_SAFE_INTEGER
            ? undefined
            : context.maxTargetFileSize,
        partCodePrefix: context.partCodePrefix,
        pbkdf2Options: context.pbkdf2Options,
        secretIvSize: context.secretIvSize,
        secretKeySize: context.secretKeySize,
      },
    )
    return configKeeper
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
