import { mkdirsIfNotExists } from '@guanghechen/commander-helper'
import crypto from 'crypto'
import fs from 'fs-extra'
import { logger } from '../../env/logger'
import {
  createRandomIv,
  createRandomKey,
  destroyBuffer,
  destroyBuffers,
} from '../buffer'
import { ErrorCode } from '../events'
import type { Cipher } from './_base'
import { BaseCipher } from './_base'

export class AESCipher extends BaseCipher implements Cipher {
  protected readonly ivSize = 32
  protected readonly keySize = 32
  protected readonly algorithm: crypto.CipherGCMTypes
  protected iv: Buffer | null
  protected key: Buffer | null

  constructor(
    options: {
      algorithm?: crypto.CipherGCMTypes
      iv?: Buffer
      key?: Buffer
    } = {},
  ) {
    super()
    this.algorithm = options.algorithm || 'aes-256-gcm'
    this.key = options.key || null
    this.iv = options.iv || null
  }

  /**
   *
   * @override
   */
  public createSecret(): Buffer {
    const { ivSize, keySize } = this
    const iv: Buffer = createRandomIv(ivSize)
    const key: Buffer = createRandomKey(keySize)
    const secret: Buffer = Buffer.alloc(iv.length + key.length)

    {
      let s = 0
      iv.copy(secret, s, 0, iv.length)
      destroyBuffer(iv)

      s += iv.length
      key.copy(secret, s, 0, key.length)
      destroyBuffer(key)
    }

    return secret
  }

  /**
   * Load key of cipher from secret
   * @override
   */
  public initKeyFromSecret(secret: Readonly<Buffer>): void | never {
    const { ivSize, keySize } = this
    const iv: Buffer = Buffer.alloc(ivSize)
    const key: Buffer = Buffer.alloc(keySize)
    secret.copy(iv, 0, 0, ivSize)
    secret.copy(key, 0, ivSize, ivSize + keySize)

    this.cleanup()
    this.iv = iv
    this.key = key
  }

  /**
   * Load key of cipher from password
   * @override
   */
  public initKeyFromPassword(password: Buffer): void | never {
    const { ivSize, keySize } = this
    const iv: Buffer = Buffer.alloc(ivSize)
    const key: Buffer = Buffer.alloc(keySize)
    let j = 0

    // generate iv
    for (let i = 0; i < ivSize; ++i) {
      iv[i] = password[j]
      j = (j + 1) % password.length
    }

    // generate key
    for (let i = 0; i < keySize; ++i) {
      key[i] = password[j]
      j = (j + 1) % password.length
    }

    this.cleanup()
    this.iv = iv
    this.key = key
  }

  /**
   * Encrypt plainData using the AES algorithm
   * @override
   */
  public encrypt(plainData: Readonly<Buffer>): Buffer {
    const { algorithm, key, iv } = this
    if (key == null || iv == null) {
      throw {
        code: ErrorCode.NULL_POINTER_ERROR,
        message: 'iv / key is null',
      }
    }

    let cipherData: Buffer
    const cipherDataPieces: Buffer[] = []
    try {
      // encrypt data
      const encipher = crypto.createCipheriv(algorithm, key, iv)
      cipherDataPieces.push(encipher.update(plainData as Buffer))
      cipherDataPieces.push(encipher.final())

      // collect encrypted data pieces
      cipherData = Buffer.concat(cipherDataPieces)
      return cipherData
    } finally {
      destroyBuffers(cipherDataPieces)
    }
  }

  /**
   * Decrypt cipherData which encrypted using the AES algorithm
   * @override
   */
  public decrypt(cipherData: Readonly<Buffer>): Buffer {
    const { algorithm, key, iv } = this
    if (key == null || iv == null) {
      throw {
        code: ErrorCode.NULL_POINTER_ERROR,
        message: 'iv / key is null',
      }
    }

    let plainData: Buffer
    const plainDataPieces: Buffer[] = []
    try {
      // decrypt data
      const decipher = crypto.createCipheriv(algorithm, key, iv)
      plainDataPieces.push(decipher.update(cipherData as Buffer))
      plainDataPieces.push(decipher.final())

      // collect decrypted data pieces
      plainData = Buffer.concat(plainDataPieces)
    } finally {
      destroyBuffers(plainDataPieces)
    }
    return plainData
  }

  /**
   * Encrypt file using the AES algorithm
   * @override
   */
  public encryptFile(
    plainFilepath: string,
    cipherFilepath: string,
  ): Promise<void> {
    const { algorithm, key, iv } = this
    if (key == null || iv == null) {
      throw {
        code: ErrorCode.NULL_POINTER_ERROR,
        message: 'iv / key is null',
      }
    }

    mkdirsIfNotExists(cipherFilepath, false, logger)
    const rStream = fs.createReadStream(plainFilepath)
    const wStream = fs.createWriteStream(cipherFilepath)
    const encipher = crypto.createCipheriv(algorithm, key, iv)
    return new Promise((resolve, reject) => {
      rStream
        .pipe(encipher)
        .pipe(wStream)
        .on('finish', resolve)
        .on('error', reject)
    })
  }

  /**
   * Decrypt file which encrypted using the AES algorithm
   * @override
   */
  public decryptFile(
    cipherFilepath: string,
    plainFilepath: string,
  ): Promise<void> {
    const { algorithm, key, iv } = this
    if (key == null || iv == null) {
      throw {
        code: ErrorCode.NULL_POINTER_ERROR,
        message: 'iv / key is null',
      }
    }

    mkdirsIfNotExists(plainFilepath, false)
    const rStream = fs.createReadStream(cipherFilepath)
    const wStream = fs.createWriteStream(plainFilepath)
    const decipher = crypto.createCipheriv(algorithm, key, iv)
    return new Promise((resolve, reject) => {
      rStream
        .pipe(decipher)
        .pipe(wStream)
        .on('finish', resolve)
        .on('error', reject)
    })
  }

  public cleanup(): void {
    destroyBuffer(this.iv)
    destroyBuffer(this.key)
    this.iv = null
    this.key = null
  }
}
