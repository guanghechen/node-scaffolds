// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import { AesGcmCipherFactoryBuilder } from '@guanghechen/cipher'
import { FileSplitter } from '@guanghechen/file-split'
import { calcFilePartItemsByCount, calcFilePartItemsBySize } from '@guanghechen/filepart'
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

  const fileSplitter = new FileSplitter()
  const sourceFilepath = locateFixtures('basic/big-file.md')
  const originalBytes = Uint8Array.from(readFileSync(sourceFilepath))
  let partFilepaths: string[] = []

  beforeAll(async () => {
    const cipherFactoryBuilder = new AesGcmCipherFactoryBuilder()
    const secret = cipherFactoryBuilder.createRandomSecret()
    const cipherFactory = cipherFactoryBuilder.buildFromSecret(secret)
    const fileCipherFactory = new FileCipherFactory({ cipherFactory, reporter })

    fileCipher = fileCipherFactory.fileCipher()
    partFilepaths = await fileSplitter.split(
      sourceFilepath,
      Array.from(calcFilePartItemsByCount(statSync(sourceFilepath).size, 5)),
    )
  })

  afterAll(async () => {
    unlinkSync(partFilepaths)
  })

  beforeEach(async () => {
    await emptyDir(workspaceDir)
  })

  afterEach(async () => {
    await rm(workspaceDir)
  })

  test('encrypt from files', async () => {
    for (let i = 0; i < 3; ++i) {
      const { cryptBytes, authTag } = await fileCipher.encryptFromFiles(partFilepaths)
      const plainBytes: Uint8Array = fileCipher.cipher.decrypt(cryptBytes, { authTag })
      expect(plainBytes).toEqual(originalBytes)
    }
  })

  test('decrypt from files', async () => {
    for (let i = 0; i < 3; ++i) {
      const cipherFilepath = sourceFilepath + '.cipher.' + Math.random()
      let cipherPartFilepaths: string[] | null = null

      try {
        expect(existsSync(cipherFilepath)).toBe(false)
        const { authTag } = await fileCipher.encryptFile(sourceFilepath, cipherFilepath)
        expect(existsSync(cipherFilepath)).toBe(true)

        cipherPartFilepaths = await fileSplitter.split(
          cipherFilepath,
          Array.from(calcFilePartItemsByCount(statSync(cipherFilepath).size, 5)),
        )
        expect(cipherPartFilepaths.length).toEqual(5)

        const plainData: Uint8Array = await fileCipher.decryptFromFiles(cipherPartFilepaths, {
          authTag,
        })
        expect(plainData).toEqual(originalBytes)
      } finally {
        unlinkSync(cipherFilepath, cipherPartFilepaths)
      }
    }
  })

  test('encrypt file', async () => {
    for (const filepath of partFilepaths) {
      const plainFilepath = filepath + '.plain.' + Math.random()
      const cipherFilepath = filepath + '.cipher.' + Math.random()

      try {
        expect(filepath).not.toEqual(plainFilepath)
        expect(filepath).not.toEqual(cipherFilepath)
        expect(plainFilepath).not.toEqual(cipherFilepath)

        expect(existsSync(plainFilepath)).toBe(false)
        expect(existsSync(cipherFilepath)).toBe(false)

        const { authTag } = await fileCipher.encryptFile(filepath, cipherFilepath)
        await fileCipher.decryptFile(cipherFilepath, plainFilepath, { authTag })

        expect(existsSync(plainFilepath)).toBe(true)
        expect(existsSync(cipherFilepath)).toBe(true)
        expect(readFileSync(plainFilepath)).toEqual(readFileSync(filepath))
      } finally {
        unlinkSync(plainFilepath, cipherFilepath)
      }
    }
  })

  test('encrypt files', async () => {
    await assertPromiseThrow(
      () => fileCipher.encryptFiles([], 'a.txt'),
      '[FileCipher.encryptFiles] plainFilepaths is empty.',
    )

    for (let i = 0; i < 3; ++i) {
      const plainFilepath = sourceFilepath + '.plain.' + Math.random()
      const cipherFilepath = sourceFilepath + '.cipher.' + Math.random()

      try {
        expect(plainFilepath).not.toEqual(cipherFilepath)
        expect(existsSync(plainFilepath)).toBe(false)
        expect(existsSync(cipherFilepath)).toBe(false)

        const { authTag } = await fileCipher.encryptFiles([sourceFilepath], cipherFilepath)
        await fileCipher.decryptFile(cipherFilepath, plainFilepath, { authTag })

        expect(existsSync(plainFilepath)).toBe(true)
        expect(existsSync(cipherFilepath)).toBe(true)
        expect(Uint8Array.from(readFileSync(plainFilepath))).toEqual(originalBytes)
      } finally {
        unlinkSync(plainFilepath, cipherFilepath)
      }
    }

    for (let i = 0; i < 3; ++i) {
      const plainFilepath = sourceFilepath + '.plain.' + Math.random()
      const cipherFilepath = sourceFilepath + '.cipher.' + Math.random()

      try {
        expect(plainFilepath).not.toEqual(cipherFilepath)
        expect(existsSync(plainFilepath)).toBe(false)
        expect(existsSync(cipherFilepath)).toBe(false)

        const { authTag } = await fileCipher.encryptFiles(partFilepaths, cipherFilepath)
        await fileCipher.decryptFile(cipherFilepath, plainFilepath, { authTag })

        expect(existsSync(plainFilepath)).toBe(true)
        expect(existsSync(cipherFilepath)).toBe(true)
        expect(Uint8Array.from(readFileSync(plainFilepath))).toEqual(originalBytes)
      } finally {
        unlinkSync(plainFilepath, cipherFilepath)
      }
    }
  })

  test('decrypt files', async () => {
    await assertPromiseThrow(
      () => fileCipher.decryptFiles([], 'a.txt'),
      '[FileCipher.decryptFiles] cryptFilepaths is empty.',
    )

    for (let i = 0; i < 3; ++i) {
      const plainFilepath = sourceFilepath + '.plain.' + Math.random()
      const cipherFilepath = sourceFilepath + '.cipher.' + Math.random()

      try {
        expect(plainFilepath).not.toEqual(cipherFilepath)
        expect(existsSync(plainFilepath)).toBe(false)
        expect(existsSync(cipherFilepath)).toBe(false)

        const { authTag } = await fileCipher.encryptFile(sourceFilepath, cipherFilepath)
        await fileCipher.decryptFiles([cipherFilepath], plainFilepath, { authTag })

        expect(existsSync(plainFilepath)).toBe(true)
        expect(existsSync(cipherFilepath)).toBe(true)
        expect(Uint8Array.from(readFileSync(plainFilepath))).toEqual(originalBytes)
      } finally {
        unlinkSync(plainFilepath, cipherFilepath)
      }
    }

    for (let i = 0; i < 3; ++i) {
      const plainFilepath = sourceFilepath + '.plain.' + Math.random()
      const plainFilepath2 = sourceFilepath + '.plain2.' + Math.random()
      const plainFilepath3 = sourceFilepath + '.plain3.' + Math.random()
      const cipherFilepath = sourceFilepath + '.cipher.' + Math.random()
      const cipherFilepath2 = sourceFilepath + '.cipher2.' + Math.random()

      let cipherPartFilepaths: string[] | null = null
      try {
        expect(plainFilepath).not.toEqual(cipherFilepath)
        expect(existsSync(plainFilepath)).toBe(false)
        expect(existsSync(plainFilepath2)).toBe(false)
        expect(existsSync(plainFilepath3)).toBe(false)
        expect(existsSync(cipherFilepath)).toBe(false)
        expect(existsSync(cipherFilepath2)).toBe(false)

        const { authTag } = await fileCipher.encryptFile(sourceFilepath, cipherFilepath)
        expect(existsSync(cipherFilepath)).toBe(true)

        await fileCipher.decryptFile(cipherFilepath, plainFilepath, { authTag })
        expect(existsSync(plainFilepath)).toBe(true)
        expect(Uint8Array.from(readFileSync(plainFilepath))).toEqual(originalBytes)

        cipherPartFilepaths = await fileSplitter.split(
          cipherFilepath,
          Array.from(calcFilePartItemsByCount(statSync(cipherFilepath).size, 5)),
        )
        expect(cipherPartFilepaths.length).toEqual(5)

        await fileSplitter.merge(cipherPartFilepaths, cipherFilepath2)
        expect(existsSync(cipherFilepath2)).toBe(true)

        await fileCipher.decryptFile(cipherFilepath2, plainFilepath2, { authTag })
        expect(existsSync(plainFilepath2)).toBe(true)
        expect(Uint8Array.from(readFileSync(plainFilepath2))).toEqual(originalBytes)

        await fileCipher.decryptFiles(cipherPartFilepaths, plainFilepath3, { authTag })
        expect(existsSync(plainFilepath3)).toBe(true)
        expect(Uint8Array.from(readFileSync(plainFilepath3))).toEqual(originalBytes)
      } finally {
        unlinkSync(
          plainFilepath,
          plainFilepath2,
          plainFilepath3,
          cipherFilepath,
          cipherFilepath2,
          cipherPartFilepaths,
        )
      }
    }
  })

  test('encrypt / decrypt big file', async () => {
    const _filepath: string = path.join(workspaceDir, 'waw.txt')
    const plainFilepath = _filepath
    const plain2Filepath = _filepath + '.plain2'
    const plain3Filepath = _filepath + '.plain3'
    const cryptFilepath = _filepath + '.crypt'
    const crypt2Filepath = _filepath + '.crypt2'
    const plainContent = 'Hello, world!'.repeat(350)
    const encoding: BufferEncoding = 'utf8'

    await writeFile(plainFilepath, plainContent, encoding)
    const { authTag } = await fileCipher.encryptFile(plainFilepath, cryptFilepath)
    const cryptContent: Buffer = await fs.readFile(cryptFilepath)

    await fileCipher.decryptFile(cryptFilepath, plain2Filepath, { authTag })
    const plain2Content = await fs.readFile(plain2Filepath, encoding)
    expect(plain2Content).toEqual(plainContent)

    const cryptParts = calcFilePartItemsBySize(statSync(cryptFilepath).size, 1024)
    const cryptPartsFilepaths = await fileSplitter.split(cryptFilepath, Array.from(cryptParts))

    await fileSplitter.merge(cryptPartsFilepaths, crypt2Filepath)
    const crypt2Content: Buffer = await fs.readFile(crypt2Filepath)
    expect(crypt2Content).toEqual(cryptContent)

    await fileCipher.decryptFiles(cryptPartsFilepaths, plain3Filepath, { authTag })
    const plain3Content = await fs.readFile(plain3Filepath, encoding)
    expect(plain3Content).toEqual(plainContent)
  })
})
