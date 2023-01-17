import type { Logger } from '@guanghechen/chalk-logger'
import { mkdirsIfNotExists } from '@guanghechen/helper-path'
import { consumeStream, consumeStreams, destroyBuffers } from '@guanghechen/helper-stream'
import type { Cipher } from 'crypto'
import fs from 'node:fs'
import type { ICipher } from '../types/cipher'
import type { IFileCipher } from '../types/file-cipher'

export interface IBaseCipherProps {
  readonly cipher: ICipher
  readonly logger?: Logger
}

/**
 * ICipher base class.
 */
export class FileCipher implements IFileCipher {
  public readonly cipher: ICipher
  protected readonly logger?: Logger

  constructor(props: IBaseCipherProps) {
    this.cipher = props.cipher
    this.logger = props.logger
  }

  // override
  public async encryptFromFiles(plainFilepaths: string[]): Promise<Buffer | never> {
    const encipher: Cipher = this.cipher.encipher()
    const pieces: Buffer[] = []
    try {
      for (const plainFilepath of plainFilepaths) {
        mkdirsIfNotExists(plainFilepath, false, this.logger)
      }

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
    const decipher: Cipher = this.cipher.decipher()
    const pieces: Buffer[] = []
    try {
      for (const cipherFilepath of cipherFilepaths) {
        mkdirsIfNotExists(cipherFilepath, false, this.logger)
      }

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
    const encipher: Cipher = this.cipher.encipher()
    return consumeStream(reader, writer, encipher)
  }

  // @override
  public decryptFile(cipherFilepath: string, plainFilepath: string): Promise<void> {
    mkdirsIfNotExists(plainFilepath, false, this.logger)
    const reader: NodeJS.ReadableStream = fs.createReadStream(cipherFilepath)
    const writer: NodeJS.WritableStream = fs.createWriteStream(plainFilepath)
    const decipher: Cipher = this.cipher.decipher()
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
    const encipher: Cipher = this.cipher.encipher()
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
    const decipher: Cipher = this.cipher.decipher()
    await consumeStreams(readers, writer, decipher)
    decipher.destroy()
  }
}
