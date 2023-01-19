import type { ICipher, ICipherFactory } from '@guanghechen/helper-cipher'
import { calcMac } from '@guanghechen/helper-cipher'
import { writeFile } from '@guanghechen/helper-fs'
import { isNonBlankString } from '@guanghechen/helper-is'
import { coverBoolean, coverNumber, coverString } from '@guanghechen/helper-option'
import { destroyBuffer } from '@guanghechen/helper-stream'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import { logger } from '../env/logger'
import { ErrorCode, EventTypes, eventBus } from './events'
import * as io from './io'

/**
 * Params for SecretMaster.constructor
 */
export interface ISecretMasterParams {
  /**
   * Factory class that produces Cipher
   */
  cipherFactory: ICipherFactory

  /**
   * Encoding of secret file
   * @default 'utf-8'
   */
  secretFileEncoding?: string

  /**
   * Encoding of secret content
   * @default 'hex'
   */
  secretContentEncoding?: BufferEncoding

  /**
   * Whether to print asterisks when entering a password
   * @default true
   */
  showAsterisk?: boolean

  /**
   * max wrong password retry times
   * @default 2
   */
  maxRetryTimes?: number

  /**
   * Minimum length of password
   * @default 6
   */
  minPasswordLength?: number

  /**
   * Maximum length of password
   * @default 100
   */
  maxPasswordLength?: number
}

export class SecretMaster {
  protected readonly cipherFactory: ICipherFactory // factory to produce Cipher
  protected readonly secretFileEncoding: BufferEncoding // encoding of secret file
  protected readonly secretContentEncoding: BufferEncoding // encoding of secret content
  protected readonly showAsterisk: boolean // whether to print password asterisks
  protected readonly maxRetryTimes: number // maximum times of failed password attempts allowed
  protected readonly minPasswordLength: number // minimum length of password
  protected readonly maxPasswordLength: number // maximum length of password
  protected _secretCipher: ICipher | null // cipher initialized by secret
  protected _encryptedSecret: Buffer | null // encrypted secret
  protected _encryptedSecretMac: Buffer | null // encrypted mac of secret plaintext

  constructor(params: ISecretMasterParams) {
    this._secretCipher = null
    this._encryptedSecret = null
    this._encryptedSecretMac = null

    this.cipherFactory = params.cipherFactory
    this.secretFileEncoding = coverString('utf8', params.secretFileEncoding, isNonBlankString)
    this.secretContentEncoding = coverString(
      'hex',
      params.secretContentEncoding,
      isNonBlankString,
    ) as BufferEncoding
    this.showAsterisk = coverBoolean(true, params.showAsterisk)
    this.maxRetryTimes = coverNumber(2, params.maxRetryTimes)
    this.minPasswordLength = coverNumber(6, params.minPasswordLength)
    this.maxPasswordLength = coverNumber(100, params.maxPasswordLength)
    eventBus.on(EventTypes.EXITING, () => this.cleanup())
  }

  /**
   * Load secret key from secret file
   * @param secretFilepath absolute filepath of secret file
   */
  public async load(secretFilepath: string): Promise<void> {
    if (!existsSync(secretFilepath)) {
      throw {
        code: ErrorCode.FILEPATH_NOT_FOUND,
        message: `cannot find secret file (${secretFilepath})`,
      }
    }

    const { cipherFactory, secretContentEncoding, secretFileEncoding } = this
    const secretContent: string = await fs.readFile(secretFilepath, secretFileEncoding)
    const secretSepIndex = secretContent.indexOf('.')
    const encryptedSecret: Buffer = Buffer.from(
      secretContent.slice(0, secretSepIndex),
      secretContentEncoding,
    )
    const encryptedSecretMac: Buffer = Buffer.from(
      secretContent.slice(secretSepIndex + 1),
      secretContentEncoding,
    )

    this._encryptedSecret = encryptedSecret
    this._encryptedSecretMac = encryptedSecretMac

    let secret: Buffer | null = null
    let password: Buffer | null = null
    let passwordCipher: ICipher | null = null
    try {
      password = await this.askPassword()
      if (password == null) {
        throw {
          code: ErrorCode.WRONG_PASSWORD,
          message: 'Password incorrect',
        }
      }
      passwordCipher = cipherFactory.initFromPassword(password)
      secret = passwordCipher.decrypt(encryptedSecret)

      this._secretCipher?.cleanup()
      this._secretCipher = cipherFactory.initFromSecret(secret)
    } finally {
      destroyBuffer(secret)
      destroyBuffer(password)
      secret = null
      password = null
      passwordCipher?.cleanup()
    }
  }

  /**
   * Dump the secret key into secret file
   * @param secretFilepath absolute filepath of secret file
   */
  public async save(secretFilepath: string): Promise<void | never> {
    const { _encryptedSecret, _encryptedSecretMac, secretContentEncoding, secretFileEncoding } =
      this

    if (_encryptedSecret == null || _encryptedSecretMac == null) {
      throw {
        code: ErrorCode.NULL_POINTER_ERROR,
        message: '[save] encryptedSecret / encryptedSecretMac are not specified',
      }
    }

    const secretContent =
      _encryptedSecret.toString(secretContentEncoding) +
      '.' +
      _encryptedSecretMac.toString(secretContentEncoding)
    await writeFile(secretFilepath, secretContent, secretFileEncoding)
  }

  /**
   * create a new secret key
   */
  public async recreate(params: Partial<ISecretMasterParams> = {}): Promise<SecretMaster> {
    const {
      cipherFactory,
      secretContentEncoding,
      showAsterisk,
      maxRetryTimes,
      minPasswordLength,
      maxPasswordLength,
    } = this

    const secretMaster = new SecretMaster({
      cipherFactory,
      secretContentEncoding,
      showAsterisk,
      maxRetryTimes,
      minPasswordLength,
      maxPasswordLength,
      ...params,
    })

    let secret: Buffer | null = null
    let password: Buffer | null = null
    let passwordCipher: ICipher | null = null

    try {
      password = await io.inputPassword(
        'Password: ',
        showAsterisk,
        3,
        minPasswordLength,
        maxPasswordLength,
      )
      const isSame = await io.confirmPassword(
        password,
        undefined,
        showAsterisk,
        minPasswordLength,
        maxPasswordLength,
      )

      if (!isSame) {
        throw {
          code: ErrorCode.ENTERED_PASSWORD_DIFFER,
          message: 'Entered passwords differ!',
        }
      }

      // use password to encrypt new secret
      passwordCipher = cipherFactory.initFromPassword(password)

      secret = cipherFactory.createRandomSecret()
      const secretMac: Buffer = calcMac(secret)
      const encryptedSecret = passwordCipher.encrypt(secret)
      const encryptedSecretMac = passwordCipher.encrypt(secretMac)

      // use new secret to init secretMaster
      secretMaster._encryptedSecret = encryptedSecret
      secretMaster._encryptedSecretMac = encryptedSecretMac
      secretMaster._secretCipher = cipherFactory.initFromSecret(secret)
    } finally {
      destroyBuffer(secret)
      destroyBuffer(password)
      secret = null
      password = null
      passwordCipher?.cleanup()
    }
    return secretMaster
  }

  public get cipher(): ICipher | null {
    return this._secretCipher?.alive ? this._secretCipher : null
  }

  /**
   * Destroy secret and sensitive data
   */
  public cleanup(): void {
    this._secretCipher?.cleanup()
  }

  /**
   * Request password
   */
  protected async askPassword(): Promise<Buffer | null> {
    const { maxRetryTimes, showAsterisk, minPasswordLength, maxPasswordLength } = this
    let password: Buffer | null = null
    for (let i = 0; i <= maxRetryTimes; ++i) {
      const question = i > 0 ? '(Retry) Password: ' : 'Password: '
      password = await io.inputPassword(
        question,
        showAsterisk,
        1,
        minPasswordLength,
        maxPasswordLength,
      )
      if (this.testPassword(password)) break
      destroyBuffer(password)
      password = null
    }
    return password
  }

  /**
   * Test whether the password is correct
   * @param password
   */
  protected testPassword(password: Buffer): boolean {
    const { cipherFactory, _encryptedSecret, _encryptedSecretMac } = this
    if (_encryptedSecret == null || _encryptedSecretMac == null) {
      logger.error('[testPassword] encryptedSecret / encryptedSecretMac are not specified')
      return false
    }

    let result = false
    let plainSecret: Buffer | null = null
    let plainSecretMac: Buffer | null = null
    let mac: Buffer | null = null
    let cipher: ICipher | null = null

    try {
      cipher = cipherFactory.initFromPassword(password)
      plainSecret = cipher.decrypt(_encryptedSecret)
      plainSecretMac = cipher.decrypt(_encryptedSecretMac)
      mac = calcMac(plainSecret)
      if (mac.compare(plainSecretMac) === 0) {
        result = true
      }
    } finally {
      destroyBuffer(plainSecret)
      destroyBuffer(plainSecretMac)
      destroyBuffer(mac)
      cipher?.cleanup()
    }
    return result
  }
}
