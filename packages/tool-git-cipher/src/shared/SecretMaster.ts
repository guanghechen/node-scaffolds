import { destroyBytes } from '@guanghechen/byte'
import type { ICipher, ICipherFactory } from '@guanghechen/cipher'
import { AesGcmCipherFactoryBuilder } from '@guanghechen/cipher'
import type { IEventBus } from '@guanghechen/event-bus'
import invariant from '@guanghechen/invariant'
import type { IReporter } from '@guanghechen/reporter.types'
import { TextFileResource } from '@guanghechen/resource'
import { createHash } from 'node:crypto'
import { ErrorCode, EventTypes } from './core/constant'
import {
  CryptSecretConfigKeeper,
  SecretConfigKeeper,
  decodeAuthTag,
  decodeCryptBytes,
  secretConfigHashAlgorithm,
} from './SecretConfig'
import type { IPresetSecretConfig, ISecretConfig, ISecretConfigData } from './SecretConfig.types'
import { confirmPassword } from './util/password/confirm'
import { inputPassword } from './util/password/input'
import { verifyWorkspacePassword } from './util/password/verify'

export interface ISecretMasterProps {
  eventBus: IEventBus<EventTypes>

  /**
   * Whether to print asterisks when entering a password
   */
  showAsterisk: boolean

  /**
   * max wrong password retry times
   */
  maxRetryTimes: number

  /**
   * Minimum length of password
   */
  minPasswordLength: number

  /**
   * Maximum length of password
   */
  maxPasswordLength: number

  /**
   * Reporter to log debug/verbose/info/warn/error messages.
   */
  reporter: IReporter
}

export class SecretMaster {
  protected readonly minPasswordLength: number
  protected readonly maxPasswordLength: number
  protected readonly maxRetryTimes: number
  protected readonly showAsterisk: boolean
  protected readonly reporter: IReporter
  protected readonly eventBus: IEventBus<EventTypes>
  #secretCipherFactory: ICipherFactory | undefined
  #secretConfigKeeper: SecretConfigKeeper | undefined

  constructor(props: ISecretMasterProps) {
    this.minPasswordLength = props.minPasswordLength
    this.maxPasswordLength = props.maxPasswordLength
    this.maxRetryTimes = props.maxRetryTimes
    this.showAsterisk = props.showAsterisk
    this.reporter = props.reporter
    this.eventBus = props.eventBus

    this.#secretCipherFactory = undefined
    this.#secretConfigKeeper = undefined
    this.eventBus.on(EventTypes.EXITING, () => this.destroy())
  }

  public get cipherFactory(): ICipherFactory | undefined {
    return this.#secretCipherFactory
  }

  public get catalogCipher(): ICipher | undefined {
    const secretCatalogNonce = this.#secretConfigKeeper?.data?.secretCatalogNonce
    return this.#secretCipherFactory && secretCatalogNonce
      ? this.#secretCipherFactory.cipher({ iv: secretCatalogNonce })
      : undefined
  }

  public getDynamicIv = (infos: ReadonlyArray<Uint8Array>): Readonly<Uint8Array> => {
    const secretNonce = this.#secretConfigKeeper?.data?.secretNonce
    const secretIvSize = this.#secretConfigKeeper?.data?.secretIvSize
    invariant(
      !!secretNonce && !!secretIvSize && !!this.#secretCipherFactory,
      '[SecretMaster.getDynamicIv] secretCipherFactory is not available.',
    )

    const sha256 = createHash('sha256')
    sha256.update(secretNonce)
    for (const info of infos) sha256.update(info)
    return sha256.digest().slice(0, secretIvSize)
  }

  // create a new secret key
  public async createSecret(params: {
    cryptRootDir: string
    filepath: string
    presetConfigData: IPresetSecretConfig
  }): Promise<SecretConfigKeeper> {
    const { cryptRootDir, filepath, presetConfigData } = params

    let password: Uint8Array | null = null
    let configKeeper: SecretConfigKeeper
    try {
      const { eventBus, showAsterisk, minPasswordLength, maxPasswordLength, reporter } = this
      reporter.debug('Asking input new password.')

      for (let i = 0; ; ++i) {
        password = await inputPassword({
          eventBus,
          question: 'Password: ',
          showAsterisk,
          maxInputRetryTimes: 2,
          minimumSize: minPasswordLength,
          maximumSize: maxPasswordLength,
        })
        const isSame = await confirmPassword({
          eventBus,
          password,
          showAsterisk,
          minimumSize: minPasswordLength,
          maximumSize: maxPasswordLength,
        })
        if (isSame) break

        reporter.error(`Entered passwords diff, try again.`)
      }

      reporter.debug('Creating new secret.')

      // Use password to encrypt new secret.
      {
        let mainCipherFactory: ICipherFactory | null = null
        let secret: Uint8Array | null = null
        let passwordCipher: ICipher | null = null
        try {
          mainCipherFactory = new AesGcmCipherFactoryBuilder({
            keySize: presetConfigData.mainKeySize,
            ivSize: presetConfigData.mainIvSize,
          }).buildFromPassword(password, presetConfigData.pbkdf2Options)
          passwordCipher = mainCipherFactory.cipher()

          const secretCipherFactoryBuilder = new AesGcmCipherFactoryBuilder({
            keySize: presetConfigData.secretKeySize,
            ivSize: presetConfigData.secretIvSize,
          })
          secret = secretCipherFactoryBuilder.createRandomSecret()

          reporter.debug('Testing the new created secret.')
          const secretCipherFactory = secretCipherFactoryBuilder.buildFromSecret(secret)
          reporter.debug('New create secret is fine.')

          const secretNonce: Uint8Array = secretCipherFactoryBuilder.createRandomIv()
          const secretCatalogNonce: Uint8Array = secretCipherFactoryBuilder.createRandomIv()

          const cSecret = passwordCipher.encrypt(secret)
          const config: ISecretConfig = {
            catalogFilepath: presetConfigData.catalogFilepath,
            contentHashAlgorithm: presetConfigData.contentHashAlgorithm,
            cryptFilepathSalt: presetConfigData.cryptFilepathSalt,
            cryptFilesDir: presetConfigData.cryptFilesDir,
            keepPlainPatterns: presetConfigData.keepPlainPatterns,
            mainIvSize: presetConfigData.mainIvSize,
            mainKeySize: presetConfigData.mainKeySize,
            maxTargetFileSize: presetConfigData.maxTargetFileSize,
            partCodePrefix: presetConfigData.partCodePrefix,
            pathHashAlgorithm: presetConfigData.pathHashAlgorithm,
            pbkdf2Options: presetConfigData.pbkdf2Options,
            secret: cSecret.cryptBytes,
            secretAuthTag: cSecret.authTag,
            secretKeySize: presetConfigData.secretKeySize,
            secretIvSize: presetConfigData.secretIvSize,
            secretNonce,
            secretCatalogNonce,
          }

          const secretCipher = secretCipherFactory.cipher()
          configKeeper = new SecretConfigKeeper({
            cipher: secretCipher,
            cryptRootDir,
            resource: new TextFileResource({ strict: true, filepath, encoding: 'utf8' }),
          })

          reporter.debug('Updating secret config.')
          await configKeeper.update(config)
          await configKeeper.save()
          reporter.debug('New secret config is saved.')

          this.#secretConfigKeeper = configKeeper
          this.#secretCipherFactory?.destroy()
          this.#secretCipherFactory = secretCipherFactory
        } finally {
          mainCipherFactory?.destroy()
          passwordCipher?.destroy()
          if (secret) destroyBytes(secret)
          secret = null
        }
      }
    } finally {
      if (password) destroyBytes(password)
      password = null
    }
    return configKeeper
  }

  // Load secret key & initialize secret cipher factory.
  public async load(params: {
    cryptRootDir: string
    filepath: string
    force: boolean
  }): Promise<SecretConfigKeeper> {
    const { cryptRootDir, filepath, force } = params
    if (!force && this.#secretConfigKeeper) return this.#secretConfigKeeper

    const { reporter } = this
    const title: string = this.constructor.name
    const resource = new TextFileResource({ strict: true, filepath, encoding: 'utf8' })
    const plainConfigKeeper = new CryptSecretConfigKeeper({
      resource,
      hashAlgorithm: secretConfigHashAlgorithm,
    })
    await plainConfigKeeper.load()

    const cryptSecretConfig = plainConfigKeeper.data
    invariant(!!cryptSecretConfig, `[${title}.load] Bad config`)

    let mainCipherFactory: ICipherFactory | null = null
    let secret: Uint8Array | null = null
    let password: Uint8Array | null = null
    let passwordCipher: ICipher | null = null
    let configKeeper: SecretConfigKeeper
    try {
      // Ask password to initialize mainCipherFactory
      password = await this._askPassword(cryptSecretConfig)
      if (password == null) {
        throw {
          code: ErrorCode.WRONG_PASSWORD,
          message: 'Password incorrect',
        }
      }
      mainCipherFactory = new AesGcmCipherFactoryBuilder({
        keySize: cryptSecretConfig.mainKeySize,
        ivSize: cryptSecretConfig.mainIvSize,
      }).buildFromPassword(password, cryptSecretConfig.pbkdf2Options)
      passwordCipher = mainCipherFactory.cipher()

      // Decrypt secret.
      reporter.debug('Trying decrypt secret.')
      const cryptSecretBytes: Uint8Array = decodeCryptBytes(cryptSecretConfig.secret)
      const authTag: Uint8Array | undefined = decodeAuthTag(cryptSecretConfig.secretAuthTag)
      secret = passwordCipher.decrypt(cryptSecretBytes, { authTag })

      // Initialize secretCipherFactory.
      const secretCipherFactory = new AesGcmCipherFactoryBuilder({
        keySize: cryptSecretConfig.secretKeySize,
        ivSize: cryptSecretConfig.secretIvSize,
      }).buildFromSecret(secret)

      const secretCipher = secretCipherFactory.cipher()
      configKeeper = new SecretConfigKeeper({
        cipher: secretCipher,
        cryptRootDir,
        resource: resource,
      })
      await configKeeper.load()

      this.#secretConfigKeeper = configKeeper
      this.#secretCipherFactory?.destroy()
      this.#secretCipherFactory = secretCipherFactory
    } finally {
      mainCipherFactory?.destroy()
      passwordCipher?.destroy()
      if (secret) destroyBytes(secret)
      if (password) destroyBytes(password)
      secret = null
      password = null
    }
    return configKeeper
  }

  // Destroy secret and sensitive data
  public destroy(): void {
    this.#secretCipherFactory?.destroy()
    this.#secretCipherFactory = undefined
  }

  // Request password.
  protected async _askPassword(
    cryptSecretConfig: Readonly<ISecretConfigData>,
  ): Promise<Uint8Array | null> {
    const { eventBus, maxRetryTimes, showAsterisk, minPasswordLength, maxPasswordLength } = this
    let password: Uint8Array | null = null
    for (let i = 0; i <= maxRetryTimes; ++i) {
      const question = i > 0 ? '(Retry) Password: ' : 'Password: '
      password = await inputPassword({
        eventBus,
        question,
        showAsterisk,
        maxInputRetryTimes: 1,
        minimumSize: minPasswordLength,
        maximumSize: maxPasswordLength,
      })
      if (await verifyWorkspacePassword(cryptSecretConfig, password)) break
      destroyBytes(password)
      password = null
    }
    return password
  }
}
