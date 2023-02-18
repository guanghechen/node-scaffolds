import { destroyBuffer } from '@guanghechen/helper-buffer'
import type { ICipher, ICipherFactory } from '@guanghechen/helper-cipher'
import { AesGcmCipherFactory } from '@guanghechen/helper-cipher'
import invariant from '@guanghechen/invariant'
import { createHash } from 'node:crypto'
import { logger } from '../env/logger'
import { ErrorCode, EventTypes, eventBus } from './events'
import { confirmPassword, inputPassword } from './password'
import type { ISecretConfigData } from './SecretConfig'
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
  #secretNonce: Buffer | null

  constructor(props: ISecretMasterProps) {
    this.showAsterisk = props.showAsterisk
    this.maxRetryTimes = props.maxRetryTimes
    this.minPasswordLength = props.minPasswordLength
    this.maxPasswordLength = props.maxPasswordLength
    this.#secretCipherFactory = null
    this.#secretNonce = null
    eventBus.on(EventTypes.EXITING, () => this.cleanup())
  }

  public get cipherFactory(): ICipherFactory | null {
    return this.#secretCipherFactory
  }

  public getDynamicIv = (infos: ReadonlyArray<Buffer>): Readonly<Buffer> => {
    invariant(
      !!this.#secretNonce && !!this.#secretCipherFactory,
      '[SecretMaster.getDynamicIv] secretCipherFactory is not available.',
    )

    const sha256 = createHash('sha256')
    sha256.update(this.#secretNonce)
    for (const info of infos) sha256.update(info)
    return sha256.digest().slice(0, this.#secretCipherFactory?.ivSize)
  }

  // create a new secret key
  public async createSecret(
    filepath: string,
    cryptRootDir: string,
    presetConfigData: Omit<ISecretConfigData, 'secret' | 'secretAuthTag' | 'secretNonce'>,
  ): Promise<SecretConfigKeeper> {
    let password: Buffer | null = null
    let configKeeper: SecretConfigKeeper
    try {
      const { showAsterisk, minPasswordLength, maxPasswordLength } = this
      logger.debug('Asking input new password.')
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
      if (!isSame) {
        throw {
          code: ErrorCode.ENTERED_PASSWORD_DIFFER,
          message: 'Entered passwords differ!',
        }
      }

      logger.debug('Creating new secret.')

      // Use password to encrypt new secret.
      {
        const mainCipherFactory = new AesGcmCipherFactory({
          keySize: presetConfigData.mainKeySize,
          ivSize: presetConfigData.mainIvSize,
        })

        let secret: Buffer | null = null
        let passwordCipher: ICipher | null = null
        try {
          mainCipherFactory.initFromPassword(password, presetConfigData.pbkdf2Options)
          passwordCipher = mainCipherFactory.cipher()

          const secretCipherFactory = new AesGcmCipherFactory({
            keySize: presetConfigData.secretKeySize,
            ivSize: presetConfigData.secretIvSize,
          })
          secret = secretCipherFactory.createRandomSecret()

          logger.debug('Testing the new created secret.')
          secretCipherFactory.initFromSecret(secret)
          logger.debug('New create secret is fine.')

          const secretNonce: Buffer = secretCipherFactory.createRandomIv()
          const secretCipher = secretCipherFactory.cipher()
          const { cryptBytes: cryptSecretNonce } = secretCipher.encrypt(secretNonce)

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
          }
          configKeeper = new SecretConfigKeeper({ filepath, cryptRootDir })

          logger.debug('Updating secret config.')
          await configKeeper.update(config)
          await configKeeper.save()
          logger.debug('New secret config is saved.')

          this.#secretCipherFactory?.cleanup()
          this.#secretCipherFactory = secretCipherFactory
        } finally {
          mainCipherFactory.cleanup()
          passwordCipher?.cleanup()
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

    this.#secretCipherFactory?.cleanup()
    this.#secretCipherFactory = null
    this.#secretCipherFactory = new AesGcmCipherFactory({
      keySize: config.secretKeySize,
      ivSize: config.secretIvSize,
    })

    // Ask password & initialize #secretCipherFactory.
    {
      const mainCipherFactory = new AesGcmCipherFactory({
        keySize: config.mainKeySize,
        ivSize: config.mainIvSize,
      })

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

        mainCipherFactory.initFromPassword(password, config.pbkdf2Options)
        passwordCipher = mainCipherFactory.cipher()

        logger.debug('Trying decrypt secret.')
        const cryptSecretBytes: Buffer = Buffer.from(config.secret, 'hex')
        const authTag: Buffer | undefined = config.secretAuthTag
          ? Buffer.from(config.secretAuthTag, 'hex')
          : undefined
        secret = passwordCipher.decrypt(cryptSecretBytes, { authTag })
        this.#secretCipherFactory.initFromSecret(secret)

        if (config.secretNonce) {
          const cryptSecretNonce: Buffer = Buffer.from(config.secretNonce, 'hex')
          this.#secretNonce = this.#secretCipherFactory.cipher().decrypt(cryptSecretNonce)
        }
      } finally {
        mainCipherFactory.cleanup()
        passwordCipher?.cleanup()
        destroyBuffer(secret)
        destroyBuffer(password)
        secret = null
        password = null
      }
    }
  }

  // Destroy secret and sensitive data
  public cleanup(): void {
    this.#secretCipherFactory?.cleanup()
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
    const mainCipherFactory = new AesGcmCipherFactory({
      keySize: config.mainKeySize,
      ivSize: config.mainIvSize,
    })

    let verified = false
    let secret: Buffer | null = null
    let passwordCipher: ICipher | null = null
    try {
      mainCipherFactory.initFromPassword(password, config.pbkdf2Options)
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
      mainCipherFactory.cleanup()
      passwordCipher?.cleanup()
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
