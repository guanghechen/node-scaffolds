import {
  coverBoolean,
  coverNumber,
  coverString,
  isNonBlankString,
} from '@guanghechen/option-helper'
import fs from 'fs-extra'
import { logger } from '../env/logger'
import { calcMac, destroyBuffer } from './buffer'
import type { Cipher, CipherFactory } from './cipher'
import { ErrorCode, EventTypes, eventBus } from './events'
import * as io from './io'

/**
 * Params for SecretMaster.constructor
 */
export interface SecretMasterParams {
  /**
   * Factory class that produces Cipher
   */
  cipherFactory: CipherFactory
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

/**
 * @member secretCipher           cipher initialized by secret
 * @member cipherFactory          factory to produce Cipher
 * @member secretFileEncoding     encoding of secret file
 * @member secretContentEncoding  encoding of secret content
 * @member showAsterisk           whether to print password asterisks
 * @member maxRetryTimes      maximum times of failed password attempts allowed
 * @member minPasswordLength      minimum length of password
 * @member maxPasswordLength      maximum length of password
 * @member encryptedSecret        encrypted secret
 * @member encryptedSecretMac     encrypted mac of secret plaintext
 * @member cleanupTimer
 * @member cleanupTimeout
 */
export class SecretMaster {
  protected readonly secretCipher: Cipher
  protected readonly cipherFactory: CipherFactory
  protected readonly secretFileEncoding: string
  protected readonly secretContentEncoding: BufferEncoding
  protected readonly showAsterisk: boolean
  protected readonly maxRetryTimes: number
  protected readonly minPasswordLength: number
  protected readonly maxPasswordLength: number
  protected encryptedSecret: Buffer | null = null
  protected encryptedSecretMac: Buffer | null = null

  constructor(params: SecretMasterParams) {
    this.secretCipher = params.cipherFactory.create()
    this.cipherFactory = params.cipherFactory
    this.secretFileEncoding = coverString(
      'utf-8',
      params.secretFileEncoding,
      isNonBlankString,
    )
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
    if (!fs.existsSync(secretFilepath)) {
      throw {
        code: ErrorCode.FILEPATH_NOT_FOUND,
        message: `cannot find secret file (${secretFilepath})`,
      }
    }

    const {
      secretCipher,
      cipherFactory,
      secretContentEncoding,
      secretFileEncoding,
    } = this
    const secretContent: string = await fs.readFile(
      secretFilepath,
      secretFileEncoding,
    )
    const secretSepIndex = secretContent.indexOf('.')
    const encryptedSecret: Buffer = Buffer.from(
      secretContent.slice(0, secretSepIndex),
      secretContentEncoding,
    )
    const encryptedSecretMac: Buffer = Buffer.from(
      secretContent.slice(secretSepIndex + 1),
      secretContentEncoding,
    )

    this.encryptedSecret = encryptedSecret
    this.encryptedSecretMac = encryptedSecretMac

    let secret: Buffer | null = null
    let password: Buffer | null = null
    const passwordCipher: Cipher = cipherFactory.create()
    try {
      password = await this.askPassword()
      if (password == null) {
        throw {
          code: ErrorCode.WRONG_PASSWORD,
          message: 'Password incorrect',
        }
      }
      passwordCipher.initKeyFromPassword(password)
      secret = passwordCipher.decrypt(encryptedSecret)
      secretCipher.initKeyFromSecret(secret)
    } finally {
      destroyBuffer(secret)
      destroyBuffer(password)
      secret = null
      password = null
      passwordCipher.cleanup()
    }
  }

  /**
   * Dump the secret key into secret file
   * @param secretFilepath absolute filepath of secret file
   */
  public async save(secretFilepath: string): Promise<void | never> {
    const {
      encryptedSecret,
      encryptedSecretMac,
      secretContentEncoding,
      secretFileEncoding,
    } = this

    if (encryptedSecret == null || encryptedSecretMac == null) {
      throw {
        code: ErrorCode.NULL_POINTER_ERROR,
        message:
          '[save] encryptedSecret / encryptedSecretMac are not specified',
      }
    }

    const secretContent =
      encryptedSecret.toString(secretContentEncoding) +
      '.' +
      encryptedSecretMac.toString(secretContentEncoding)
    await fs.writeFile(secretFilepath, secretContent, secretFileEncoding)
  }

  /**
   * create a new secret key
   */
  public async recreate(
    params: Partial<SecretMasterParams> = {},
  ): Promise<SecretMaster> {
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
    const passwordCipher: Cipher = cipherFactory.create()
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
      passwordCipher.initKeyFromPassword(password)

      secret = secretMaster.secretCipher.createSecret()
      const secretMac: Buffer = calcMac(secret)
      const encryptedSecret = passwordCipher.encrypt(secret)
      const encryptedSecretMac = passwordCipher.encrypt(secretMac)

      // use new secret to init secretMaster
      secretMaster.encryptedSecret = encryptedSecret
      secretMaster.encryptedSecretMac = encryptedSecretMac
      secretMaster.secretCipher.initKeyFromSecret(secret)
    } finally {
      destroyBuffer(secret)
      destroyBuffer(password)
      secret = null
      password = null
      passwordCipher.cleanup()
    }
    return secretMaster
  }

  public getCipher(): Cipher {
    return this.secretCipher
  }

  /**
   * Destroy secret and sensitive data
   */
  public cleanup(): void {
    this.secretCipher.cleanup()
  }

  /**
   * Request password
   */
  protected async askPassword(): Promise<Buffer | null> {
    const {
      maxRetryTimes,
      showAsterisk,
      minPasswordLength,
      maxPasswordLength,
    } = this
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
    const { cipherFactory, encryptedSecret, encryptedSecretMac } = this
    if (encryptedSecret == null || encryptedSecretMac == null) {
      logger.error(
        '[testPassword] encryptedSecret / encryptedSecretMac are not specified',
      )
      return false
    }

    let result = false
    let plainSecret: Buffer | null = null
    let plainSecretMac: Buffer | null = null
    let mac: Buffer | null = null
    const cipher = cipherFactory.create()

    try {
      cipher.initKeyFromPassword(password)
      plainSecret = cipher.decrypt(encryptedSecret)
      plainSecretMac = cipher.decrypt(encryptedSecretMac)
      mac = calcMac(plainSecret)
      if (mac.compare(plainSecretMac) === 0) {
        result = true
      }
    } finally {
      destroyBuffer(plainSecret)
      destroyBuffer(plainSecretMac)
      destroyBuffer(mac)
      cipher.cleanup()
    }
    return result
  }
}
