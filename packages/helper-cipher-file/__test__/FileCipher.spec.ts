// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import { AesGcmCipherFactoryBuilder } from '@guanghechen/cipher'
import { FileSplitter } from '@guanghechen/file-split'
import { calcFilePartItemsByCount, calcFilePartItemsBySize } from '@guanghechen/filepart'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import { Reporter } from '@guanghechen/reporter'
import {
  assertPromiseThrow,
  emptyDir,
  locateFixtures,
  rm,
  unlinkSync,
  writeFile,
} from 'jest.helper'
import { existsSync, readFileSync, statSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { IFileCipher } from '../src'
import { FileCipherFactory } from '../src'

describe('FileCipher', () => {
  const workspaceDir: string = locateFixtures('__fictitious__.FileCipher')
  const reporter = new Reporter(chalk, { flights: { colorful: false, date: false } })
  let fileCipher: IFileCipher

  const plainRootDir: string = locateFixtures('')
  const cryptRootDir: string = locateFixtures('')
  const plainPathResolver = new WorkspacePathResolver(plainRootDir, pathResolver)
  const cryptPathResolver = new WorkspacePathResolver(cryptRootDir, pathResolver)

  const fileSplitter = new FileSplitter()
  const absolutePlainPath0 = locateFixtures('basic/big-file.md')
  const originalBytes = Uint8Array.from(readFileSync(absolutePlainPath0))
  let plainPaths: string[] = []

  beforeAll(async () => {
    const cipherFactoryBuilder = new AesGcmCipherFactoryBuilder()
    const secret = cipherFactoryBuilder.createRandomSecret()
    const cipherFactory = cipherFactoryBuilder.buildFromSecret(secret)
    const fileCipherFactory = new FileCipherFactory({ cipherFactory, reporter })

    fileCipher = fileCipherFactory.fileCipher({
      iv: undefined,
      cryptPathResolver,
      plainPathResolver,
    })
    plainPaths = await fileSplitter.split(
      absolutePlainPath0,
      Array.from(calcFilePartItemsByCount(statSync(absolutePlainPath0).size, 5)),
    )
  })

  afterAll(async () => {
    unlinkSync(plainPaths)
  })

  beforeEach(async () => {
    await emptyDir(workspaceDir)
  })

  afterEach(async () => {
    await rm(workspaceDir)
  })

  test('encrypt from files', async () => {
    for (let i = 0; i < 3; ++i) {
      const { cryptBytes, authTag } = await fileCipher.encryptFromFiles({ plainPaths })
      const plainBytes: Uint8Array = fileCipher.cipher.decrypt(cryptBytes, { authTag })
      expect(plainBytes).toEqual(originalBytes)
    }
  })

  test('decrypt from files', async () => {
    for (let i = 0; i < 3; ++i) {
      const absoluteCryptPath = absolutePlainPath0 + '.cipher.' + Math.random()
      let cryptPathParts: string[] | null = null

      try {
        expect(existsSync(absoluteCryptPath)).toBe(false)
        const { authTag } = await fileCipher.encryptFile({
          cryptPath: absoluteCryptPath,
          plainPath: absolutePlainPath0,
        })
        expect(existsSync(absoluteCryptPath)).toBe(true)

        cryptPathParts = await fileSplitter.split(
          absoluteCryptPath,
          Array.from(calcFilePartItemsByCount(statSync(absoluteCryptPath).size, 5)),
        )
        expect(cryptPathParts.length).toEqual(5)

        const plainData: Uint8Array = await fileCipher.decryptFromFiles({
          authTag,
          cryptPaths: cryptPathParts,
        })
        expect(plainData).toEqual(originalBytes)
      } finally {
        unlinkSync(absoluteCryptPath, cryptPathParts)
      }
    }
  })

  test('encrypt file', async () => {
    for (const plainPath of plainPaths) {
      const absolutePlainPath: string = plainPath + '.plain.' + Math.random()
      const absoluteCryptPath: string = plainPath + '.cipher.' + Math.random()

      try {
        expect(plainPath).not.toEqual(absolutePlainPath)
        expect(plainPath).not.toEqual(absoluteCryptPath)
        expect(absolutePlainPath).not.toEqual(absoluteCryptPath)

        expect(existsSync(absolutePlainPath)).toBe(false)
        expect(existsSync(absoluteCryptPath)).toBe(false)

        const { authTag } = await fileCipher.encryptFile({
          cryptPath: absoluteCryptPath,
          plainPath,
        })
        await fileCipher.decryptFile({
          authTag,
          cryptPath: absoluteCryptPath,
          plainPath: absolutePlainPath,
        })

        expect(existsSync(absolutePlainPath)).toBe(true)
        expect(existsSync(absoluteCryptPath)).toBe(true)
        expect(readFileSync(absolutePlainPath)).toEqual(readFileSync(plainPath))
      } finally {
        unlinkSync(absolutePlainPath, absoluteCryptPath)
      }
    }
  })

  test('encrypt files', async () => {
    await assertPromiseThrow(
      () => fileCipher.encryptFiles({ cryptPath: 'a.txt', plainPaths: [] }),
      '[FileCipher.encryptFiles] plainPaths is empty.',
    )

    for (let i = 0; i < 3; ++i) {
      const absolutePlainPath: string = absolutePlainPath0 + '.plain.' + Math.random()
      const absoluteCryptPath: string = absolutePlainPath0 + '.cipher.' + Math.random()

      try {
        expect(absolutePlainPath).not.toEqual(absoluteCryptPath)
        expect(existsSync(absolutePlainPath)).toBe(false)
        expect(existsSync(absoluteCryptPath)).toBe(false)

        const { authTag } = await fileCipher.encryptFiles({
          cryptPath: absoluteCryptPath,
          plainPaths: [absolutePlainPath0],
        })
        await fileCipher.decryptFile({
          authTag,
          cryptPath: absoluteCryptPath,
          plainPath: absolutePlainPath,
        })

        expect(existsSync(absolutePlainPath)).toBe(true)
        expect(existsSync(absoluteCryptPath)).toBe(true)
        expect(Uint8Array.from(readFileSync(absolutePlainPath))).toEqual(originalBytes)
      } finally {
        unlinkSync(absolutePlainPath, absoluteCryptPath)
      }
    }

    for (let i = 0; i < 3; ++i) {
      const absolutePlainPath: string = absolutePlainPath0 + '.plain.' + Math.random()
      const absoluteCryptPath: string = absolutePlainPath0 + '.cipher.' + Math.random()

      try {
        expect(absolutePlainPath).not.toEqual(absoluteCryptPath)
        expect(existsSync(absolutePlainPath)).toBe(false)
        expect(existsSync(absoluteCryptPath)).toBe(false)

        const { authTag } = await fileCipher.encryptFiles({
          cryptPath: absoluteCryptPath,
          plainPaths,
        })
        await fileCipher.decryptFile({
          authTag,
          cryptPath: absoluteCryptPath,
          plainPath: absolutePlainPath,
        })

        expect(existsSync(absolutePlainPath)).toBe(true)
        expect(existsSync(absoluteCryptPath)).toBe(true)
        expect(Uint8Array.from(readFileSync(absolutePlainPath))).toEqual(originalBytes)
      } finally {
        unlinkSync(absolutePlainPath, absoluteCryptPath)
      }
    }
  })

  test('decrypt files', async () => {
    await assertPromiseThrow(
      () =>
        fileCipher.decryptFiles({
          authTag: undefined,
          cryptPaths: [],
          plainPath: 'a.txt',
        }),
      '[FileCipher.decryptFiles] cryptPaths is empty.',
    )

    for (let i = 0; i < 3; ++i) {
      const absolutePlainPath: string = absolutePlainPath0 + '.plain.' + Math.random()
      const absoluteCryptPath: string = absolutePlainPath0 + '.cipher.' + Math.random()

      try {
        expect(absolutePlainPath).not.toEqual(absoluteCryptPath)
        expect(existsSync(absolutePlainPath)).toBe(false)
        expect(existsSync(absoluteCryptPath)).toBe(false)

        const { authTag } = await fileCipher.encryptFile({
          cryptPath: absoluteCryptPath,
          plainPath: absolutePlainPath0,
        })
        await fileCipher.decryptFiles({
          authTag,
          cryptPaths: [absoluteCryptPath],
          plainPath: absolutePlainPath,
        })

        expect(existsSync(absolutePlainPath)).toBe(true)
        expect(existsSync(absoluteCryptPath)).toBe(true)
        expect(Uint8Array.from(readFileSync(absolutePlainPath))).toEqual(originalBytes)
      } finally {
        unlinkSync(absolutePlainPath, absoluteCryptPath)
      }
    }

    for (let i = 0; i < 3; ++i) {
      const plainPath = absolutePlainPath0 + '.plain.' + Math.random()
      const plainPath2 = absolutePlainPath0 + '.plain2.' + Math.random()
      const plainPath3 = absolutePlainPath0 + '.plain3.' + Math.random()
      const cryptPath = absolutePlainPath0 + '.cipher.' + Math.random()
      const cryptPath2 = absolutePlainPath0 + '.cipher2.' + Math.random()

      let cryptPathParts: string[] | null = null
      try {
        expect(plainPath).not.toEqual(cryptPath)
        expect(existsSync(plainPath)).toBe(false)
        expect(existsSync(plainPath2)).toBe(false)
        expect(existsSync(plainPath3)).toBe(false)
        expect(existsSync(cryptPath)).toBe(false)
        expect(existsSync(cryptPath2)).toBe(false)

        const { authTag } = await fileCipher.encryptFile({
          cryptPath,
          plainPath: absolutePlainPath0,
        })
        expect(existsSync(cryptPath)).toBe(true)

        await fileCipher.decryptFile({
          authTag,
          cryptPath,
          plainPath,
        })
        expect(existsSync(plainPath)).toBe(true)
        expect(Uint8Array.from(readFileSync(plainPath))).toEqual(originalBytes)

        cryptPathParts = await fileSplitter.split(
          cryptPath,
          Array.from(calcFilePartItemsByCount(statSync(cryptPath).size, 5)),
        )
        expect(cryptPathParts.length).toEqual(5)

        await fileSplitter.merge(cryptPathParts, cryptPath2)
        expect(existsSync(cryptPath2)).toBe(true)

        await fileCipher.decryptFile({ authTag, plainPath: plainPath2, cryptPath: cryptPath2 })
        expect(existsSync(plainPath2)).toBe(true)
        expect(Uint8Array.from(readFileSync(plainPath2))).toEqual(originalBytes)

        await fileCipher.decryptFiles({
          authTag,
          cryptPaths: cryptPathParts,
          plainPath: plainPath3,
        })
        expect(existsSync(plainPath3)).toBe(true)
        expect(Uint8Array.from(readFileSync(plainPath3))).toEqual(originalBytes)
      } finally {
        unlinkSync(plainPath, plainPath2, plainPath3, cryptPath, cryptPath2, cryptPathParts)
      }
    }
  })

  test('encrypt / decrypt big file', async () => {
    const _filepath: string = path.join(workspaceDir, 'waw.txt')
    const plainPath = _filepath
    const plainPath2 = _filepath + '.plain2'
    const plainPath3 = _filepath + '.plain3'
    const cryptPath = _filepath + '.crypt'
    const crypt2Filepath = _filepath + '.crypt2'
    const plainContent = 'Hello, world!'.repeat(350)
    const encoding: BufferEncoding = 'utf8'

    await writeFile(plainPath, plainContent, encoding)
    const { authTag } = await fileCipher.encryptFile({ cryptPath, plainPath })
    const cryptContent: Buffer = await fs.readFile(cryptPath)

    await fileCipher.decryptFile({ authTag, cryptPath, plainPath: plainPath2 })
    const plain2Content = await fs.readFile(plainPath2, encoding)
    expect(plain2Content).toEqual(plainContent)

    const cryptParts = calcFilePartItemsBySize(statSync(cryptPath).size, 1024)
    const cryptPathParts = await fileSplitter.split(cryptPath, Array.from(cryptParts))

    await fileSplitter.merge(cryptPathParts, crypt2Filepath)
    const crypt2Content: Buffer = await fs.readFile(crypt2Filepath)
    expect(crypt2Content).toEqual(cryptContent)

    await fileCipher.decryptFiles({ authTag, cryptPaths: cryptPathParts, plainPath: plainPath3 })
    const plain3Content = await fs.readFile(plainPath3, encoding)
    expect(plain3Content).toEqual(plainContent)
  })
})
