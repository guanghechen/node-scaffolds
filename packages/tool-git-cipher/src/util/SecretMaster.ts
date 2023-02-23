import { destroyBuffer } from '@guanghechen/helper-buffer'
import type { ICipher, ICipherFactory } from '@guanghechen/helper-cipher'
import { AesGcmCipherFactoryBuilder } from '@guanghechen/helper-cipher'
import { FileStorage } from '@guanghechen/helper-storage'
import invariant from '@guanghechen/invariant'
import { createHash } from 'node:crypto'
import { logger } from '../env/logger'
import { ErrorCode, EventTypes, eventBus } from './events'
import { confirmPassword, inputPassword } from './password'
import type { IPresetSecretConfigData, ISecretConfigData } from './SecretConfig'
import { SecretConfigKeeper } from './SecretConfig'

export interface ISecretMasterProps {
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
}

export class SecretMaster {
  protected readonly showAsterisk: boolean
  protected readonly maxRetryTimes: number
  protected readonly minPasswordLength: number
  protected readonly maxPasswordLength: number
  #secretCipherFactory: ICipherFactory | null
  #secretCatalogNonce: Buffer | null
  #secretNonce: Buffer | null
  #secretIvSize: number | undefined

  constructor(props: ISecretMasterProps) {
    this.showAsterisk = props.showAsterisk
    this.maxRetryTimes = props.maxRetryTimes
    this.minPasswordLength = props.minPasswordLength
    this.maxPasswordLength = props.maxPasswordLength
    this.#secretCipherFactory = null
    this.#secretNonce = null
    this.#secretCatalogNonce = null
    this.#secretIvSize = undefined
    eventBus.on(EventTypes.EXITING, () => this.destroy())
  }

  public get cipherFactory(): ICipherFactory | null {
    return this.#secretCipherFactory
  }

  public get catalogCipher(): ICipher | null {
    return this.#secretCipherFactory && this.#secretCatalogNonce
      ? this.#secretCipherFactory.cipher({ iv: this.#secretCatalogNonce })
      : null
  }

  public getDynamicIv = (infos: ReadonlyArray<Buffer>): Readonly<Buffer> => {
    invariant(
      !!this.#secretNonce && !!this.#secretCipherFactory,
      '[SecretMaster.getDynamicIv] secretCipherFactory is not available.',
    )

    const sha256 = createHash('sha256')
    sha256.update(this.#secretNonce)
    for (const info of infos) sha256.update(info)
    return sha256.digest().slice(0, this.#secretIvSize)
  }

  // create a new secret key
  public async createSecret(
    filepath: string,
    cryptRootDir: string,
    presetConfigData: IPresetSecretConfigData,
  ): Promise<SecretConfigKeeper> {
    let password: Buffer | null = null
    let configKeeper: SecretConfigKeeper
    try {
      const { showAsterisk, minPasswordLength, maxPasswordLength } = this
      logger.debug('Asking input new password.')

      for (let i = 0; ; ++i) {
        password = await inputPassword({
          question: 'Password: ',
          showAsterisk,
          maxInputRetryTimes: 2,
          minimumSize: minPasswordLength,
          maximumSize: maxPasswordLength,
        })
        const isSame = await confirmPassword({
          password,
          showAsterisk,
          minimumSize: minPasswordLength,
          maximumSize: maxPasswordLength,
        })
        if (isSame) break

        logger.error(`Entered passwords diff, try again.`)
      }

      logger.debug('Creating new secret.')

      // Use password to encrypt new secret.
      {
        let mainCipherFactory: ICipherFactory | null = null
        let secret: Buffer | null = null
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

          logger.debug('Testing the new created secret.')
          const secretCipherFactory = secretCipherFactoryBuilder.buildFromSecret(secret)
          logger.debug('New create secret is fine.')

          const secretNonce: Buffer = secretCipherFactoryBuilder.createRandomIv()
          const secretCatalogNnoce: Buffer = secretCipherFactoryBuilder.createRandomIv()
          const secretCipher = secretCipherFactory.cipher()
          const { cryptBytes: cryptSecretNonce } = secretCipher.encrypt(secretNonce)
          const { cryptBytes: cryptSecretCatalogNnoce } = secretCipher.encrypt(secretCatalogNnoce)

          const { cryptBytes, authTag } = passwordCipher.encrypt(secret)
          const config: ISecretConfigData = {
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
            secret: cryptBytes.toString('hex'),
            secretAuthTag: authTag ? authTag.toString('hex') : undefined,
            secretKeySize: presetConfigData.secretKeySize,
            secretIvSize: presetConfigData.secretIvSize,
            secretNonce: cryptSecretNonce.toString('hex'),
            secretCatalogNonce: cryptSecretCatalogNnoce.toString('hex'),
          }
          configKeeper = new SecretConfigKeeper({
            cryptRootDir,
            storage: new FileStorage({ strict: true, filepath, encoding: 'utf8' }),
          })

          logger.debug('Updating secret config.')
          await configKeeper.update(config)
          await configKeeper.save()
          logger.debug('New secret config is saved.')

          this.#secretCipherFactory?.destroy()
          this.#secretCipherFactory = secretCipherFactory
        } finally {
          mainCipherFactory?.destroy()
          passwordCipher?.destroy()
          destroyBuffer(secret)
          secret = null
        }
      }
    } finally {
      destroyBuffer(password)
      password = null
    }
    return configKeeper
  }

  // Load secret key & initialize secret cipher factory.
  public async load(configKeeper: SecretConfigKeeper): Promise<void> {
    const config: ISecretConfigData = await this._loadConfig(configKeeper)

    this.#secretCipherFactory?.destroy()
    this.#secretCipherFactory = null

    // Ask password & initialize #secretCipherFactory.
    {
      let mainCipherFactory: ICipherFactory | null = null
      let secret: Buffer | null = null
      let password: Buffer | null = null
      let passwordCipher: ICipher | null = null
      try {
        password = await this._askPassword(configKeeper)
        if (password == null) {
          throw {
            code: ErrorCode.WRONG_PASSWORD,
            message: 'Password incorrect',
          }
        }
        mainCipherFactory = new AesGcmCipherFactoryBuilder({
          keySize: config.mainKeySize,
          ivSize: config.mainIvSize,
        }).buildFromPassword(password, config.pbkdf2Options)
        passwordCipher = mainCipherFactory.cipher()

        logger.debug('Trying decrypt secret.')
        const cryptSecretBytes: Buffer = Buffer.from(config.secret, 'hex')
        const authTag: Buffer | undefined = config.secretAuthTag
          ? Buffer.from(config.secretAuthTag, 'hex')
          : undefined
        secret = passwordCipher.decrypt(cryptSecretBytes, { authTag })
        this.#secretCipherFactory = new AesGcmCipherFactoryBuilder({
          keySize: config.secretKeySize,
          ivSize: config.secretIvSize,
        }).buildFromSecret(secret)

        if (config.secretNonce) {
          const cryptSecretNonce: Buffer = Buffer.from(config.secretNonce, 'hex')
          this.#secretNonce = this.#secretCipherFactory.cipher().decrypt(cryptSecretNonce)
        }
        if (config.secretCatalogNonce) {
          const cryptSecretCatalogNonce: Buffer = Buffer.from(config.secretCatalogNonce, 'hex')
          this.#secretCatalogNonce = this.#secretCipherFactory
            .cipher()
            .decrypt(cryptSecretCatalogNonce)
        }
      } finally {
        mainCipherFactory?.destroy()
        passwordCipher?.destroy()
        destroyBuffer(secret)
        destroyBuffer(password)
        secret = null
        password = null
      }
    }
  }

  // Destroy secret and sensitive data
  public destroy(): void {
    this.#secretCipherFactory?.destroy()
    this.#secretCipherFactory = null
  }

  // Request password.
  protected async _askPassword(configKeeper: SecretConfigKeeper): Promise<Buffer | null> {
    const { maxRetryTimes, showAsterisk, minPasswordLength, maxPasswordLength } = this
    let password: Buffer | null = null
    for (let i = 0; i <= maxRetryTimes; ++i) {
      const question = i > 0 ? '(Retry) Password: ' : 'Password: '
      password = await inputPassword({
        question,
        showAsterisk,
        maxInputRetryTimes: 1,
        minimumSize: minPasswordLength,
        maximumSize: maxPasswordLength,
      })
      if (await this._verifyPassword(configKeeper, password)) break
      destroyBuffer(password)
      password = null
    }
    return password
  }

  // Test whether the password is correct.
  protected async _verifyPassword(
    configKeeper: SecretConfigKeeper,
    password: Readonly<Buffer>,
  ): Promise<boolean> {
    const config: ISecretConfigData = await this._loadConfig(configKeeper)

    let mainCipherFactory: ICipherFactory | null = null
    let verified = false
    let secret: Buffer | null = null
    let passwordCipher: ICipher | null = null
    try {
      mainCipherFactory = new AesGcmCipherFactoryBuilder({
        keySize: config.mainKeySize,
        ivSize: config.mainIvSize,
      }).buildFromPassword(password, config.pbkdf2Options)
      passwordCipher = mainCipherFactory.cipher()

      const cryptSecretBytes: Buffer = Buffer.from(config.secret, 'hex')
      const authTag: Buffer | undefined = config.secretAuthTag
        ? Buffer.from(config.secretAuthTag, 'hex')
        : undefined
      secret = passwordCipher.decrypt(cryptSecretBytes, { authTag })
      verified = true
    } catch (error: any) {
      if (/Unsupported state or unable to authenticate data/.test(error?.message ?? '')) {
        verified = false
      } else {
        throw error
      }
    } finally {
      mainCipherFactory?.destroy()
      passwordCipher?.destroy()
      destroyBuffer(secret)
      secret = null
    }
    return verified
  }

  protected async _loadConfig(
    configKeeper: SecretConfigKeeper,
  ): Promise<ISecretConfigData | never> {
    if (configKeeper.data === undefined) await configKeeper.load()

    const title: string = this.constructor.name
    const config: ISecretConfigData | undefined = configKeeper.data
    invariant(!!config, `[${title}.load] Bad config`)
    return config
  }
}
