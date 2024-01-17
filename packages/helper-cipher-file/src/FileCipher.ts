import { destroyBytesList, mergeBytes } from '@guanghechen/byte'
import type { ICipher, IEncryptResult } from '@guanghechen/cipher'
import { mkdirsIfNotExists } from '@guanghechen/helper-fs'
import invariant from '@guanghechen/invariant'
import type { IWorkspacePathResolver } from '@guanghechen/path.types'
import type { IReporter } from '@guanghechen/reporter.types'
import { consumeStream, consumeStreams } from '@guanghechen/stream'
import { createReadStream, createWriteStream } from 'node:fs'
import type { IFileCipher } from './types/IFileCipher'

export interface IFileCipherProps {
  readonly cipher: ICipher
  readonly cryptPathResolver: IWorkspacePathResolver
  readonly plainPathResolver: IWorkspacePathResolver
  readonly reporter?: IReporter
}

const clazz = 'FileCipher'

export class FileCipher implements IFileCipher {
  public readonly cipher: ICipher
  public readonly cryptPathResolver: IWorkspacePathResolver
  public readonly plainPathResolver: IWorkspacePathResolver
  protected readonly reporter: IReporter | undefined

  constructor(props: IFileCipherProps) {
    this.cipher = props.cipher
    this.cryptPathResolver = props.cryptPathResolver
    this.plainPathResolver = props.plainPathResolver
    this.reporter = props.reporter
  }

  // override
  public async encryptFromFiles(params: { plainPaths: string[] }): Promise<IEncryptResult> {
    const { plainPathResolver } = this
    const { plainPaths } = params

    const readers: NodeJS.ReadableStream[] = []
    for (const plainPath of plainPaths) {
      const absolutePlainPath: string = plainPathResolver.resolve(plainPath)
      mkdirsIfNotExists(absolutePlainPath, false, this.reporter)
      const reader: NodeJS.ReadableStream = createReadStream(absolutePlainPath)
      readers.push(reader)
    }

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
  public async decryptFromFiles(params: {
    authTag: Readonly<Uint8Array> | undefined
    cryptPaths: string[]
  }): Promise<Uint8Array> {
    const { cryptPathResolver } = this
    const { authTag, cryptPaths } = params

    const readers: NodeJS.ReadableStream[] = []
    for (const cryptPath of cryptPaths) {
      const absoluteCryptPath: string = cryptPathResolver.resolve(cryptPath)
      mkdirsIfNotExists(absoluteCryptPath, false, this.reporter)
      const reader: NodeJS.ReadableStream = createReadStream(absoluteCryptPath)
      readers.push(reader)
    }

    const decipher = this.cipher.decipher({ authTag })
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
  public async encryptFile(params: {
    cryptPath: string
    plainPath: string
  }): Promise<Omit<IEncryptResult, 'cryptBytes'>> {
    const { cryptPathResolver, plainPathResolver } = this
    const absolutePlainPath: string = plainPathResolver.resolve(params.plainPath)
    const absoluteCryptPath: string = cryptPathResolver.resolve(params.cryptPath)

    mkdirsIfNotExists(absoluteCryptPath, false, this.reporter)

    const reader: NodeJS.ReadableStream = createReadStream(absolutePlainPath)
    const writer: NodeJS.WritableStream = createWriteStream(absoluteCryptPath)
    const encipher = this.cipher.encipher()

    let authTag: Uint8Array | undefined
    try {
      await consumeStream(reader, writer, encipher)
      const auth: Uint8Array | undefined = encipher.getAuthTag?.()
      if (auth !== undefined) authTag = Uint8Array.from(auth)
    } finally {
      encipher.destroy()
    }
    return { authTag }
  }

  // @override
  public async decryptFile(params: {
    authTag: Readonly<Uint8Array> | undefined
    cryptPath: string
    plainPath: string
  }): Promise<void> {
    const { cryptPathResolver, plainPathResolver } = this
    const absolutePlainPath: string = plainPathResolver.resolve(params.plainPath)
    const absoluteCryptPath: string = cryptPathResolver.resolve(params.cryptPath)
    const { authTag } = params

    mkdirsIfNotExists(absolutePlainPath, false, this.reporter)

    const reader: NodeJS.ReadableStream = createReadStream(absoluteCryptPath)
    const writer: NodeJS.WritableStream = createWriteStream(absolutePlainPath)
    const decipher = this.cipher.decipher({ authTag })

    try {
      await consumeStream(reader, writer, decipher)
    } finally {
      decipher.destroy()
    }
  }

  // override
  public async encryptFiles(params: {
    cryptPath: string
    plainPaths: string[]
  }): Promise<Omit<IEncryptResult, 'cryptBytes'>> {
    const { cryptPath, plainPaths } = params
    invariant(plainPaths.length > 0, `[${clazz}.encryptFiles] plainPaths is empty.`)

    if (plainPaths.length === 1) return this.encryptFile({ cryptPath, plainPath: plainPaths[0] })

    const { cryptPathResolver, plainPathResolver } = this
    const absoluteCryptPath: string = cryptPathResolver.resolve(cryptPath)

    mkdirsIfNotExists(absoluteCryptPath, false, this.reporter)

    const readers: NodeJS.ReadableStream[] = []
    for (const plainPath of plainPaths) {
      const absolutePlainPath: string = plainPathResolver.resolve(plainPath)
      const reader: NodeJS.ReadableStream = createReadStream(absolutePlainPath)
      readers.push(reader)
    }
    const writer: NodeJS.WritableStream = createWriteStream(absoluteCryptPath)
    const encipher = this.cipher.encipher()

    let authTag: Uint8Array | undefined
    try {
      await consumeStreams(readers, writer, encipher)
      const auth: Uint8Array | undefined = encipher.getAuthTag?.()
      if (auth !== undefined) authTag = Uint8Array.from(auth)
    } finally {
      encipher.destroy()
    }
    return { authTag }
  }

  // override
  public async decryptFiles(params: {
    authTag: Readonly<Uint8Array> | undefined
    cryptPaths: string[]
    plainPath: string
  }): Promise<void> {
    const { authTag, cryptPaths, plainPath } = params
    invariant(cryptPaths.length > 0, `[${clazz}.decryptFiles] cryptPaths is empty.`)

    if (cryptPaths.length === 1) {
      return this.decryptFile({ authTag, cryptPath: cryptPaths[0], plainPath })
    }

    const { cryptPathResolver, plainPathResolver } = this
    const absolutePlainPath: string = plainPathResolver.resolve(plainPath)

    mkdirsIfNotExists(absolutePlainPath, false, this.reporter)

    const readers: NodeJS.ReadableStream[] = []
    for (const cryptPath of cryptPaths) {
      const absoluteCryptPath: string = cryptPathResolver.resolve(cryptPath)
      const reader: NodeJS.ReadableStream = createReadStream(absoluteCryptPath)
      readers.push(reader)
    }
    const writer: NodeJS.WritableStream = createWriteStream(plainPath)
    const decipher = this.cipher.decipher({ authTag })

    try {
      await consumeStreams(readers, writer, decipher)
    } finally {
      decipher.destroy()
    }
  }
}
