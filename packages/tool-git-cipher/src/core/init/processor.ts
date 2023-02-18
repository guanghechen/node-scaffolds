import { hasGitInstalled } from '@guanghechen/helper-commander'
import { isNonExistentOrEmpty, mkdirsIfNotExists } from '@guanghechen/helper-fs'
import { initGitRepo, stageAll } from '@guanghechen/helper-git'
import { isNonBlankString } from '@guanghechen/helper-is'
import { absoluteOfWorkspace, relativeOfWorkspace } from '@guanghechen/helper-path'
import { runPlop } from '@guanghechen/helper-plop'
import invariant from '@guanghechen/invariant'
import { execa } from 'execa'
import inquirer from 'inquirer'
import nodePlop from 'node-plop'
import { existsSync } from 'node:fs'
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
    const presetSecretData: Omit<ISecretConfigData, 'secret' | 'secretAuthTag' | 'secretNonce'> = {
      catalogFilepath: context.catalogFilepath,
      contentHashAlgorithm: context.contentHashAlgorithm,
      cryptFilepathSalt: context.cryptFilepathSalt,
      cryptFilesDir: context.cryptFilesDir,
      keepPlainPatterns: context.keepPlainPatterns,
      mainIvSize: context.mainIvSize,
      mainKeySize: context.mainKeySize,
      maxTargetFileSize:
        context.maxTargetFileSize > Number.MAX_SAFE_INTEGER ? undefined : context.maxTargetFileSize,
      partCodePrefix: context.partCodePrefix,
      pathHashAlgorithm: context.pathHashAlgorithm,
      pbkdf2Options: context.pbkdf2Options,
      secretIvSize: context.secretIvSize,
      secretKeySize: context.secretKeySize,
    }

    const isWorkspaceEmpty = isNonExistentOrEmpty(context.workspace)
    const isSecretExist = existsSync(context.secretFilepath)
    mkdirsIfNotExists(context.workspace, true)
    mkdirsIfNotExists(context.plainRootDir, true)

    if (isWorkspaceEmpty) {
      // Render boilerplates if the workspace is non-exist or empty.
      const relativeConfigPaths: string[] = context.configFilepaths.map(fp =>
        relativeOfWorkspace(context.workspace, fp),
      )
      await this._renderBoilerplates({
        ...presetSecretData,
        configFilepath: relativeConfigPaths.find(fp => fp.endsWith('.json')) ?? '.ghc-config.json',
        secret: '',
        secretAuthTag: '',
        secretNonce: '',
      })

      // Init git repo.
      await initGitRepo({
        cwd: context.plainRootDir,
        logger,
        eol: 'lf',
        encoding: 'utf-8',
        gpgSign: context.gitGpgSign,
      })
      await stageAll({ cwd: context.plainRootDir, logger })
    }

    let shouldGenerateSecret = true
    if (isSecretExist) {
      // Regenerate secret.
      shouldGenerateSecret = await inquirer
        .prompt([
          {
            type: 'confirm',
            name: 'shouldGenerateNewSecret',
            default: false,
            message:
              'The repo seems initialized, do you want to generate new secret? (!!!WARNING this will invalid the existed crypt commits)',
          },
        ])
        .then(md => md.shouldGenerateNewSecret)
    }

    logger.verbose('Creating secret.')
    if (shouldGenerateSecret) {
      const {
        cryptFilepathSalt,
        mainIvSize,
        mainKeySize,
        pbkdf2Options_digest,
        pbkdf2Options_iterations,
        pbkdf2Options_salt,
        secretIvSize,
        secretKeySize,
      } = await inquirer.prompt([
        {
          type: 'number',
          name: 'mainKeySize',
          default: context.mainKeySize,
          message: 'mainKeySize',
        },
        {
          type: 'number',
          name: 'mainIvSize',
          default: context.mainIvSize,
          message: 'mainIvSize',
        },
        {
          type: 'number',
          name: 'secretKeySize',
          default: context.secretKeySize,
          message: 'secretKeySize',
        },
        {
          type: 'number',
          name: 'secretIvSize',
          default: context.secretIvSize,
          message: 'secretIvSize',
        },
        {
          type: 'string',
          name: 'pbkdf2Options_salt',
          default: context.pbkdf2Options.salt,
          message: 'pbkdf2Options.salt',
          filter: x => x.trim(),
          transformer: (x: string) => x.trim(),
        },
        {
          type: 'number',
          name: 'pbkdf2Options_iterations',
          default: context.pbkdf2Options.iterations,
          message: 'pbkdf2Options.iterations',
        },
        {
          type: 'list',
          name: 'pbkdf2Options_digest',
          default: context.pbkdf2Options.digest,
          message: 'pbkdf2Options.digest',
          choices: ['sha256'],
          filter: x => x.trim(),
          transformer: (x: string) => x.trim(),
        },
        {
          type: 'string',
          name: 'cryptFilepathSalt',
          default: context.cryptFilepathSalt,
          message: 'cryptFilepathSalt',
          filter: x => x.trim(),
          transformer: (x: string) => x.trim(),
        },
      ])

      // Create secret file.
      await this._createSecret({
        ...presetSecretData,
        cryptFilepathSalt,
        mainIvSize,
        mainKeySize,
        pbkdf2Options: {
          salt: pbkdf2Options_salt,
          iterations: pbkdf2Options_iterations,
          digest: pbkdf2Options_digest,
        },
        secretIvSize,
        secretKeySize,
      })
      logger.info('Secret generated and stored.')
    }
  }

  // Render boilerplates.
  protected async _renderBoilerplates(
    data: ISecretConfigData & { configFilepath: string },
  ): Promise<void> {
    const { context } = this

    // request repository url
    let { plainRepoUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'plainRepoUrl',
        message: 'Resource git repository url?',
        filter: x => x.trim(),
        transformer: (x: string) => x.trim(),
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

    const boilerplate = resolveTemplateFilepath('plop.mjs')
    const plop = await nodePlop(boilerplate, {
      force: false,
      destBasePath: context.workspace,
    })

    const error = await runPlop(plop, undefined, {
      bakPlainRootDir: 'ghc-plain-bak',
      catalogCacheFilepath: relativeOfWorkspace(context.workspace, context.catalogCacheFilepath),
      catalogFilepath: relativeOfWorkspace(context.cryptRootDir, context.catalogFilepath),
      commandVersion: COMMAND_VERSION,
      configFilepath: data.configFilepath,
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
      secret: data.secret,
      secretAuthTag: data.secretAuthTag,
      secretFilepath: relativeOfWorkspace(context.workspace, context.secretFilepath),
      secretIvSize: context.secretIvSize,
      secretKeySize: context.secretKeySize,
      showAsterisk: context.showAsterisk,
      workspace: context.workspace,
      plainRepoUrl,
    })
    if (error) logger.error(error)
  }

  // Create secret file
  protected async _createSecret(
    presetConfigData: Omit<ISecretConfigData, 'secret' | 'secretAuthTag' | 'secretNonce'>,
  ): Promise<SecretConfigKeeper> {
    const { context, secretMaster } = this
    const configKeeper = await secretMaster.createSecret(
      context.secretFilepath,
      context.cryptRootDir,
      presetConfigData,
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
