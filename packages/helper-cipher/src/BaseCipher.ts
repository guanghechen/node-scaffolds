import type ChalkLogger from '@guanghechen/chalk-logger'
import { mkdirsIfNotExists } from '@guanghechen/helper-path'
import { consumeStream, consumeStreams, destroyBuffers } from '@guanghechen/helper-stream'
import type { Cipher } from 'crypto'
import fs from 'fs-extra'
import type { ICipher } from './types/cipher'

/**
 * ICipher base class.
 */
export abstract class BaseCipher implements ICipher {
  protected readonly logger?: ChalkLogger

  constructor(logger?: ChalkLogger) {
    this.logger = logger
  }

  // override
  public encrypt(plainData: Readonly<Buffer>): Buffer | never {
    const encipher = this.encipher()
    const cipherDataPieces: Buffer[] = []
    let cipherData: Buffer

    try {
      // Collect and encrypt data
      cipherDataPieces.push(encipher.update(plainData))
      cipherDataPieces.push(encipher.final())
      cipherData = Buffer.concat(cipherDataPieces)
    } finally {
      destroyBuffers(cipherDataPieces)
      encipher.destroy()
    }

    return cipherData
  }

  // override
  public decrypt(cipherData: Readonly<Buffer>): Buffer | never {
    const decipher = this.decipher()
    const plainDataPieces: Buffer[] = []
    let plainData: Buffer

    try {
      // Collect and decrypt data
      plainDataPieces.push(decipher.update(cipherData))
      plainDataPieces.push(decipher.final())
      plainData = Buffer.concat(plainDataPieces)
    } finally {
      destroyBuffers(plainDataPieces)
      decipher.destroy()
    }

    return plainData
  }

  // override
  public async encryptFromFiles(plainFilepaths: string[]): Promise<Buffer | never> {
    const encipher: Cipher = this.encipher()
    const pieces: Buffer[] = []
    try {
      const readers: NodeJS.ReadableStream[] = plainFilepaths.map(fp => fs.createReadStream(fp))
      await consumeStreams(readers, encipher)
      for await (const chunk of encipher) pieces.push(chunk)
      return Buffer.concat(pieces)
    } finally {
      destroyBuffers(pieces)
      encipher.destroy()
    }
  }

  // override
  public async decryptFromFiles(cipherFilepaths: string[]): Promise<Buffer> {
    const decipher: Cipher = this.decipher()
    const pieces: Buffer[] = []
    try {
      const readers: NodeJS.ReadableStream[] = cipherFilepaths.map(fp => fs.createReadStream(fp))
      await consumeStreams(readers, decipher)
      for await (const chunk of decipher) pieces.push(chunk)
      return Buffer.concat(pieces)
    } finally {
      destroyBuffers(pieces)
      decipher.destroy()
    }
  }

  // @override
  public encryptFile(plainFilepath: string, cipherFilepath: string): Promise<void> {
    mkdirsIfNotExists(cipherFilepath, false, this.logger)
    const reader: NodeJS.ReadableStream = fs.createReadStream(plainFilepath)
    const writer: NodeJS.WritableStream = fs.createWriteStream(cipherFilepath)
    const encipher: Cipher = this.encipher()
    return consumeStream(reader, writer, encipher)
  }

  // @override
  public decryptFile(cipherFilepath: string, plainFilepath: string): Promise<void> {
    mkdirsIfNotExists(plainFilepath, false, this.logger)
    const reader: NodeJS.ReadableStream = fs.createReadStream(cipherFilepath)
    const writer: NodeJS.WritableStream = fs.createWriteStream(plainFilepath)
    const decipher: Cipher = this.decipher()
    return consumeStream(reader, writer, decipher)
  }

  // override
  public async encryptFiles(plainFilepaths: string[], cipherFilepath: string): Promise<void> {
    if (plainFilepaths.length <= 0) return
    if (plainFilepaths.length === 1) {
      await this.encryptFile(plainFilepaths[0], cipherFilepath)
      return
    }

    mkdirsIfNotExists(cipherFilepath, false, this.logger)
    const readers: NodeJS.ReadableStream[] = plainFilepaths.map(fp => fs.createReadStream(fp))
    const writer: NodeJS.WritableStream = fs.createWriteStream(cipherFilepath)
    const encipher: Cipher = this.encipher()
    await consumeStreams(readers, writer, encipher)
    encipher.destroy()
  }

  // override
  public async decryptFiles(cipherFilepaths: string[], plainFilepath: string): Promise<void> {
    if (cipherFilepaths.length <= 0) return
    if (cipherFilepaths.length === 1) {
      await this.decryptFile(cipherFilepaths[0], plainFilepath)
      return
    }

    mkdirsIfNotExists(plainFilepath, false, this.logger)
    const readers: NodeJS.ReadableStream[] = cipherFilepaths.map(fp => fs.createReadStream(fp))
    const writer: NodeJS.WritableStream = fs.createWriteStream(plainFilepath)
    const decipher: Cipher = this.decipher()
    await consumeStreams(readers, writer, decipher)
    decipher.destroy()
  }

  protected abstract encipher(): Cipher

  protected abstract decipher(): Cipher

  // @override
  public abstract createSecret(): Buffer

  // @override
  public abstract initFromSecret(secret: Readonly<Buffer>): void | never

  // @override
  public abstract initFromPassword(password: Readonly<Buffer>): void | never

  // @override
  public abstract cleanup(): void
}
