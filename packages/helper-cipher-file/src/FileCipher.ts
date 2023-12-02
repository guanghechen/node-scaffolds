import { destroyBytesList, mergeBytes } from '@guanghechen/byte'
import type { ICipher, IDecipherOptions, IEncryptResult } from '@guanghechen/cipher'
import { mkdirsIfNotExists } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import type { IReporter } from '@guanghechen/reporter.types'
import { consumeStream, consumeStreams } from '@guanghechen/stream'
import { createReadStream, createWriteStream } from 'node:fs'
import type { IFileCipher } from './types/IFileCipher'

export interface IFileCipherProps {
  readonly cipher: ICipher
  readonly reporter?: IReporter
}

export class FileCipher implements IFileCipher {
  public readonly cipher: ICipher
  protected readonly reporter?: IReporter

  constructor(props: IFileCipherProps) {
    this.cipher = props.cipher
    this.reporter = props.reporter
  }

  // override
  public async encryptFromFiles(plainFilepaths: string[]): Promise<IEncryptResult> {
    for (const fp of plainFilepaths) mkdirsIfNotExists(fp, false, this.reporter)
    const readers: NodeJS.ReadableStream[] = plainFilepaths.map(fp => createReadStream(fp))
    const encipher = this.cipher.encipher()
    const pieces: Uint8Array[] = []

    let cryptBytes: Uint8Array
    let authTag: Uint8Array | undefined
    try {
      await consumeStreams(readers, encipher)
      for await (const chunk of encipher) pieces.push(chunk)
      cryptBytes = mergeBytes(pieces)
      authTag = encipher.getAuthTag?.()
    } finally {
      destroyBytesList(pieces)
      encipher.destroy()
    }
    return { cryptBytes, authTag }
  }

  // override
  public async decryptFromFiles(
    cryptFilepaths: string[],
    options: IDecipherOptions,
  ): Promise<Uint8Array> {
    for (const fp of cryptFilepaths) mkdirsIfNotExists(fp, false, this.reporter)
    const readers: NodeJS.ReadableStream[] = cryptFilepaths.map(fp => createReadStream(fp))
    const decipher = this.cipher.decipher(options)
    const plainBytesList: Uint8Array[] = []

    let plainBytes: Uint8Array
    try {
      await consumeStreams(readers, decipher)
      for await (const chunk of decipher) plainBytesList.push(chunk)
      plainBytes = mergeBytes(plainBytesList)
    } finally {
      destroyBytesList(plainBytesList)
      decipher.destroy()
    }
    return plainBytes
  }

  // @override
  public async encryptFile(
    plainFilepath: string,
    cryptFilepath: string,
  ): Promise<Omit<IEncryptResult, 'cryptBytes'>> {
    mkdirsIfNotExists(cryptFilepath, false, this.reporter)
    const reader: NodeJS.ReadableStream = createReadStream(plainFilepath)
    const writer: NodeJS.WritableStream = createWriteStream(cryptFilepath)
    const encipher = this.cipher.encipher()

    let authTag: Uint8Array | undefined
    try {
      await consumeStream(reader, writer, encipher)
      authTag = encipher.getAuthTag?.()
    } finally {
      encipher.destroy()
    }
    return {
      authTag: authTag ? Uint8Array.from(authTag) : undefined,
    }
  }

  // @override
  public async decryptFile(
    cryptFilepath: string,
    plainFilepath: string,
    options: IDecipherOptions,
  ): Promise<void> {
    mkdirsIfNotExists(plainFilepath, false, this.reporter)
    const reader: NodeJS.ReadableStream = createReadStream(cryptFilepath)
    const writer: NodeJS.WritableStream = createWriteStream(plainFilepath)
    const decipher = this.cipher.decipher(options)

    try {
      await consumeStream(reader, writer, decipher)
    } finally {
      decipher.destroy()
    }
  }

  // override
  public async encryptFiles(
    plainFilepaths: string[],
    cryptFilepath: string,
  ): Promise<Omit<IEncryptResult, 'cryptBytes'>> {
    invariant(plainFilepaths.length > 0, '[FileCipher.encryptFiles] plainFilepaths is empty.')

    if (plainFilepaths.length === 1) return this.encryptFile(plainFilepaths[0], cryptFilepath)

    mkdirsIfNotExists(cryptFilepath, false, this.reporter)
    const readers: NodeJS.ReadableStream[] = plainFilepaths.map(fp => createReadStream(fp))
    const writer: NodeJS.WritableStream = createWriteStream(cryptFilepath)
    const encipher = this.cipher.encipher()

    let authTag: Uint8Array | undefined
    try {
      await consumeStreams(readers, writer, encipher)
      authTag = encipher.getAuthTag?.()
    } finally {
      encipher.destroy()
    }
    return {
      authTag: authTag ? Uint8Array.from(authTag) : undefined,
    }
  }

  // override
  public async decryptFiles(
    cryptFIlepaths: string[],
    plainFilepath: string,
    options: IDecipherOptions,
  ): Promise<void> {
    invariant(cryptFIlepaths.length > 0, '[FileCipher.decryptFiles] cryptFilepaths is empty.')

    if (cryptFIlepaths.length === 1) {
      return void (await this.decryptFile(cryptFIlepaths[0], plainFilepath, options))
    }

    mkdirsIfNotExists(plainFilepath, false, this.reporter)
    const readers: NodeJS.ReadableStream[] = cryptFIlepaths.map(fp => createReadStream(fp))
    const writer: NodeJS.WritableStream = createWriteStream(plainFilepath)
    const decipher = this.cipher.decipher(options)

    try {
      await consumeStreams(readers, writer, decipher)
    } finally {
      decipher.destroy()
    }
  }
}
