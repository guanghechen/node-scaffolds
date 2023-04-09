import { destroyBuffer } from '@guanghechen/helper-buffer'
import type { ICipher, ICipherFactory } from '@guanghechen/helper-cipher'
import { AesGcmCipherFactoryBuilder } from '@guanghechen/helper-cipher'
import { FileStorage } from '@guanghechen/helper-storage'
import invariant from '@guanghechen/invariant'
import { createHash } from 'node:crypto'
import { logger } from '../env/logger'
import { ErrorCode, EventTypes, eventBus } from './events'
import { confirmPassword, inputPassword } from './password'
import {
  CryptSecretConfigKeeper,
  SecretConfigKeeper,
  decodeAuthTag,
  decodeCryptBytes,
  secretConfigHashAlgorithm,
} from './SecretConfig'
import type { IPresetSecretConfig, ISecretConfig, ISecretConfigData } from './SecretConfig.types'

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
  #secretCipherFactory: ICipherFactory | undefined
  #secretConfigKeeper: SecretConfigKeeper | undefined

  constructor(props: ISecretMasterProps) {
    this.showAsterisk = props.showAsterisk
    this.maxRetryTimes = props.maxRetryTimes
    this.minPasswordLength = props.minPasswordLength
    this.maxPasswordLength = props.maxPasswordLength
    this.#secretCipherFactory = undefined
    this.#secretConfigKeeper = undefined
    eventBus.on(EventTypes.EXITING, () => this.destroy())
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

  public getDynamicIv = (infos: ReadonlyArray<Buffer>): Readonly<Buffer> => {
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
          const secretCatalogNonce: Buffer = secretCipherFactoryBuilder.createRandomIv()

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
            storage: new FileStorage({ strict: true, filepath, encoding: 'utf8' }),
          })

          logger.debug('Updating secret config.')
          await configKeeper.update(config)
          await configKeeper.save()
          logger.debug('New secret config is saved.')

          this.#secretConfigKeeper = configKeeper
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
  public async load(params: {
    cryptRootDir: string
    filepath: string
    force: boolean
  }): Promise<SecretConfigKeeper> {
    if (!params.force && this.#secretConfigKeeper) return this.#secretConfigKeeper

    const title: string = this.constructor.name
    const { cryptRootDir, filepath } = params
    const storage = new FileStorage({ strict: true, filepath, encoding: 'utf8' })
    const plainConfigKeeper = new CryptSecretConfigKeeper({
      storage,
      hashAlgorithm: secretConfigHashAlgorithm,
    })
    await plainConfigKeeper.load()

    const cryptSecretConfig = plainConfigKeeper.data
    invariant(!!cryptSecretConfig, `[${title}.load] Bad config`)

    let mainCipherFactory: ICipherFactory | null = null
    let secret: Buffer | null = null
    let password: Buffer | null = null
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
      logger.debug('Trying decrypt secret.')
      const cryptSecretBytes: Buffer = decodeCryptBytes(cryptSecretConfig.secret)
      const authTag: Buffer | undefined = decodeAuthTag(cryptSecretConfig.secretAuthTag)
      secret = passwordCipher.decrypt(cryptSecretBytes, { authTag })

      // Initialize secretCipherFactory.
      const secretCipherFactory = new AesGcmCipherFactoryBuilder({
        keySize: cryptSecretConfig.secretKeySize,
        ivSize: cryptSecretConfig.secretIvSize,
      }).buildFromSecret(secret)

      const secretCipher = secretCipherFactory.cipher()
      configKeeper = new SecretConfigKeeper({ cipher: secretCipher, cryptRootDir, storage })
      await configKeeper.load()

      this.#secretConfigKeeper = configKeeper
      this.#secretCipherFactory?.destroy()
      this.#secretCipherFactory = secretCipherFactory
    } finally {
      mainCipherFactory?.destroy()
      passwordCipher?.destroy()
      destroyBuffer(secret)
      destroyBuffer(password)
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
  ): Promise<Buffer | null> {
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
      if (await this._verifyPassword(cryptSecretConfig, password)) break
      destroyBuffer(password)
      password = null
    }
    return password
  }

  // Test whether the password is correct.
  protected async _verifyPassword(
    cryptSecretConfig: Readonly<ISecretConfigData>,
    password: Readonly<Buffer>,
  ): Promise<boolean> {
    let mainCipherFactory: ICipherFactory | null = null
    let verified = false
    let secret: Buffer | null = null
    let passwordCipher: ICipher | null = null
    try {
      const cryptSecretBytes: Buffer = decodeCryptBytes(cryptSecretConfig.secret)
      const authTag: Buffer | undefined = decodeAuthTag(cryptSecretConfig.secretAuthTag)

      mainCipherFactory = new AesGcmCipherFactoryBuilder({
        keySize: cryptSecretConfig.mainKeySize,
        ivSize: cryptSecretConfig.mainIvSize,
      }).buildFromPassword(password, cryptSecretConfig.pbkdf2Options)
      passwordCipher = mainCipherFactory.cipher()
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
}
