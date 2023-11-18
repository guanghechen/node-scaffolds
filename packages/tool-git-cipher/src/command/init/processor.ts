import { bytes2text, randomBytes } from '@guanghechen/byte'
import { hasGitInstalled } from '@guanghechen/helper-commander'
import { isNonExistentOrEmpty, mkdirsIfNotExists } from '@guanghechen/helper-fs'
import { initGitRepo, stageAll } from '@guanghechen/helper-git'
import { isNonBlankString } from '@guanghechen/helper-is'
import { runPlop } from '@guanghechen/helper-plop'
import invariant from '@guanghechen/invariant'
import { pathResolver } from '@guanghechen/path'
import { execa } from 'execa'
import inquirer from 'inquirer'
import nodePlop from 'node-plop'
import { existsSync } from 'node:fs'
import { resolveTemplateFilepath } from '../../core/config'
import { COMMAND_VERSION } from '../../core/constant'
import { reporter } from '../../core/reporter'
import type { SecretConfigKeeper } from '../../util/SecretConfig'
import type { IPresetSecretConfig } from '../../util/SecretConfig.types'
import { SecretMaster } from '../../util/SecretMaster'
import type { IGitCipherInitContext } from './context'

export class GitCipherInitProcessor {
  protected readonly context: IGitCipherInitContext
  protected secretMaster: SecretMaster

  constructor(context: IGitCipherInitContext) {
    reporter.debug('context:', context)

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
    const { plainPathResolver } = context
    const presetSecretData: IPresetSecretConfig = {
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
    mkdirsIfNotExists(context.workspace, true)
    mkdirsIfNotExists(plainPathResolver.root, true)

    if (isWorkspaceEmpty) {
      // Render boilerplates if the workspace is non-exist or empty.
      const relativeConfigPaths: string[] = context.configFilepaths.map(fp =>
        pathResolver.safeRelative(context.workspace, fp, true),
      )
      await this._renderBoilerplates({
        configFilepath: relativeConfigPaths.find(fp => fp.endsWith('.json')) ?? '.ghc-config.json',
      })

      // Init git repo.
      await initGitRepo({
        cwd: plainPathResolver.root,
        reporter,
        eol: 'lf',
        encoding: 'utf8',
        gpgSign: context.gitGpgSign,
      })
      await stageAll({ cwd: plainPathResolver.root, reporter })
    }

    let shouldGenerateSecret = true
    if (existsSync(context.secretFilepath)) {
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

    reporter.verbose('Creating secret.')
    if (shouldGenerateSecret) {
      const {
        cryptFilepathSalt,
        cryptFilesDir,
        mainIvSize,
        mainKeySize,
        maxTargetFileSize,
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
        {
          type: 'string',
          name: 'cryptFilesDir',
          default: context.cryptFilesDir,
          message: 'cryptFilesDir',
          filter: x => x.trim(),
          transformer: (x: string) => x.trim(),
        },
        {
          type: 'number',
          name: 'maxTargetFileSize',
          default: context.maxTargetFileSize,
          message: 'maxTargetFileSize (bytes)',
        },
      ])

      // Create secret file.
      await this._createSecret({
        ...presetSecretData,
        cryptFilepathSalt,
        cryptFilesDir,
        mainIvSize,
        mainKeySize,
        maxTargetFileSize,
        pbkdf2Options: {
          salt: pbkdf2Options_salt,
          iterations: pbkdf2Options_iterations,
          digest: pbkdf2Options_digest,
        },
        secretIvSize,
        secretKeySize,
      })
      reporter.info('Secret generated and stored.')
    }
  }

  // Render boilerplates.
  protected async _renderBoilerplates(data: { configFilepath: string }): Promise<void> {
    const { context } = this
    const { cryptPathResolver, plainPathResolver } = context

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
        plainRepoUrl = pathResolver.safeResolve(context.workspace, plainRepoUrl)
      }
    }
    reporter.debug('plainRepoUrl:', plainRepoUrl)

    // clone plaintext repository
    if (isNonBlankString(plainRepoUrl)) {
      await this._cloneFromRemote(plainRepoUrl)
      return
    }

    const boilerplate = resolveTemplateFilepath('plop.mjs')
    const plop = await nodePlop(boilerplate, {
      force: false,
      destBasePath: context.workspace,
    })

    const error = await runPlop(plop, undefined, {
      bakPlainRootDir: pathResolver.safeRelative(context.workspace, plainPathResolver.root, true),
      catalogFilepath: pathResolver.safeRelative(
        cryptPathResolver.root,
        context.catalogFilepath,
        true,
      ),
      commandVersion: COMMAND_VERSION,
      configFilepath: data.configFilepath,
      configNonce: bytes2text(randomBytes(20), 'hex'),
      cryptFilepathSalt: context.cryptFilepathSalt,
      cryptFilesDir: pathResolver.safeRelative(cryptPathResolver.root, context.cryptFilesDir, true),
      cryptRootDir: pathResolver.safeRelative(context.workspace, cryptPathResolver.root, true),
      encoding: context.encoding,
      logLevel: reporter.level,
      mainIvSize: context.mainIvSize,
      mainKeySize: context.mainKeySize,
      maxPasswordLength: context.maxPasswordLength,
      minPasswordLength: context.minPasswordLength,
      partCodePrefix: context.partCodePrefix,
      pbkdf2Options: context.pbkdf2Options,
      plainRootDir: pathResolver.safeRelative(context.workspace, plainPathResolver.root, true),
      secret: '',
      secretAuthTag: undefined,
      secretNonce: '',
      secretCatalogNonce: '',
      secretFilepath: pathResolver.safeRelative(context.workspace, context.secretFilepath, true),
      secretIvSize: context.secretIvSize,
      secretKeySize: context.secretKeySize,
      showAsterisk: context.showAsterisk,
      workspace: context.workspace,
      plainRepoUrl,
    })
    if (error) reporter.error(error)
  }

  // Create secret file
  protected async _createSecret(
    presetConfigData: IPresetSecretConfig,
  ): Promise<SecretConfigKeeper> {
    const { context, secretMaster } = this
    const configKeeper = await secretMaster.createSecret({
      cryptRootDir: context.cryptPathResolver.root,
      filepath: context.secretFilepath,
      presetConfigData,
    })
    return configKeeper
  }

  /**
   * Clone from remote plaintext repository
   * @param plainRepoUrl  url of remote source repository
   */
  protected async _cloneFromRemote(plainRepoUrl: string): Promise<void> {
    const { context } = this
    const { plainPathResolver } = context
    mkdirsIfNotExists(plainPathResolver.root, true, reporter)
    await execa('git', ['clone', plainRepoUrl, plainPathResolver.root], {
      stdio: 'inherit',
      cwd: plainPathResolver.root,
    })
  }
}
