import { destroyBytes, text2bytes } from '@guanghechen/byte'
import type { ICipher, ICipherFactory } from '@guanghechen/cipher'
import { AesGcmCipherFactoryBuilder } from '@guanghechen/cipher'
import invariant from '@guanghechen/invariant'
import { calcMac } from '@guanghechen/mac'
import type { IReporter } from '@guanghechen/reporter.types'
import { FileTextResource } from '@guanghechen/resource'
import { CustomErrorCode } from './core/constant'
import {
  CryptSecretConfigKeeper,
  SecretConfigKeeper,
  decodeAuthTag,
  decodeCryptBytes,
  secretConfigHashAlgorithm,
} from './SecretConfig'
import type { IPresetSecretConfig, ISecretConfig, ISecretConfigData } from './SecretConfig.types'
import type { IInputAnswer } from './util/input/answer'
import { confirmPassword } from './util/password/confirm'
import { inputPassword } from './util/password/input'
import { verifyWorkspacePassword } from './util/password/verify'

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

  /**
   * Reporter to log debug/verbose/info/warn/error messages.
   */
  reporter: IReporter

  inputAnswer: IInputAnswer
}

export class SecretMaster {
  protected readonly minPasswordLength: number
  protected readonly maxPasswordLength: number
  protected readonly maxRetryTimes: number
  protected readonly showAsterisk: boolean
  protected readonly reporter: IReporter
  protected readonly inputAnswer: IInputAnswer
  #secretCipherFactory: ICipherFactory | undefined
  #secretConfigKeeper: SecretConfigKeeper | undefined

  constructor(props: ISecretMasterProps) {
    this.minPasswordLength = props.minPasswordLength
    this.maxPasswordLength = props.maxPasswordLength
    this.maxRetryTimes = props.maxRetryTimes
    this.showAsterisk = props.showAsterisk
    this.reporter = props.reporter
    this.inputAnswer = props.inputAnswer

    this.#secretCipherFactory = undefined
    this.#secretConfigKeeper = undefined
  }

  public get contentCipherFactory(): ICipherFactory | undefined {
    return this.#secretCipherFactory
  }

  public get catalogCipherFactory(): ICipherFactory | undefined {
    return this.#secretCipherFactory
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
      const { showAsterisk, minPasswordLength, maxPasswordLength, reporter, inputAnswer } = this
      reporter.debug('Asking input new password.')

      for (let i = 0; ; ++i) {
        password = await inputPassword({
          question: 'Password: ',
          showAsterisk,
          maxInputRetryTimes: 2,
          minimumSize: minPasswordLength,
          maximumSize: maxPasswordLength,
          inputAnswer,
        })
        const isSame = await confirmPassword({
          password,
          showAsterisk,
          minimumSize: minPasswordLength,
          maximumSize: maxPasswordLength,
          inputAnswer,
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
          const cSecret = passwordCipher.encrypt(secret)
          const config: ISecretConfig = {
            catalogConfigPath: presetConfigData.catalogConfigPath,
            contentHashAlgorithm: presetConfigData.contentHashAlgorithm,
            cryptPathSalt: presetConfigData.cryptPathSalt,
            cryptFilesDir: presetConfigData.cryptFilesDir,
            integrityPatterns: presetConfigData.integrityPatterns,
            keepPlainPatterns: presetConfigData.keepPlainPatterns,
            mainIvSize: presetConfigData.mainIvSize,
            mainKeySize: presetConfigData.mainKeySize,
            maxCryptFileSize: presetConfigData.maxCryptFileSize,
            partCodePrefix: presetConfigData.partCodePrefix,
            pathHashAlgorithm: presetConfigData.pathHashAlgorithm,
            pbkdf2Options: presetConfigData.pbkdf2Options,
            secret: cSecret.cryptBytes,
            secretAuthTag: cSecret.authTag,
            secretKeySize: presetConfigData.secretKeySize,
            secretIvSize: presetConfigData.secretIvSize,
            secretNonce,
          }

          const secretCipher = secretCipherFactory.cipher()
          configKeeper = new SecretConfigKeeper({
            cipher: secretCipher,
            cryptRootDir,
            resource: new FileTextResource({ strict: true, filepath, encoding: 'utf8' }),
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

  // Destroy secret and sensitive data
  public destroy(): void {
    this.#secretCipherFactory?.destroy()
    this.#secretCipherFactory = undefined
  }

  public genNonceByCommitMessage = (message: string): Uint8Array => {
    const mac = calcMac([text2bytes(message, 'utf8')], 'sha256')
    return mac.slice(0, 16)
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
    const resource = new FileTextResource({ strict: true, filepath, encoding: 'utf8' })
    const cryptSecretConfigKeeper = new CryptSecretConfigKeeper({
      resource,
      hashAlgorithm: secretConfigHashAlgorithm,
    })
    const cryptSecretConfig: ISecretConfigData = await cryptSecretConfigKeeper.load()
    invariant(!!cryptSecretConfig, `[${title}.load] Bad config`)

    let mainCipherFactory: ICipherFactory | null = null
    let secret: Uint8Array | null = null
    let password: Uint8Array | null = null
    let passwordCipher: ICipher | null = null
    let secretConfigKeeper: SecretConfigKeeper
    try {
      // Ask password to initialize mainCipherFactory
      password = await this._askPassword(cryptSecretConfig)
      if (password == null) {
        throw {
          code: CustomErrorCode.WRONG_PASSWORD,
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
      secretConfigKeeper = new SecretConfigKeeper({ cipher: secretCipher, cryptRootDir, resource })
      await secretConfigKeeper.load()

      this.#secretConfigKeeper = secretConfigKeeper
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
    return secretConfigKeeper
  }

  // Request password.
  protected async _askPassword(
    cryptSecretConfig: Readonly<ISecretConfigData>,
  ): Promise<Uint8Array | null> {
    const { maxRetryTimes, showAsterisk, minPasswordLength, maxPasswordLength, inputAnswer } = this
    let password: Uint8Array | null = null
    for (let i = 0; i <= maxRetryTimes; ++i) {
      const question = i > 0 ? '(Retry) Password: ' : 'Password: '
      password = await inputPassword({
        question,
        showAsterisk,
        maxInputRetryTimes: 1,
        minimumSize: minPasswordLength,
        maximumSize: maxPasswordLength,
        inputAnswer,
      })
      if (await verifyWorkspacePassword(cryptSecretConfig, password)) break
      destroyBytes(password)
      password = null
    }
    return password
  }
}
