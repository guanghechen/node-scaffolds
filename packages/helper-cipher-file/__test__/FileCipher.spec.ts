import ChalkLogger from '@guanghechen/chalk-logger'
import { AesCipherFactory } from '@guanghechen/helper-cipher'
import {
  BigFileHelper,
  calcFilePartItemsByCount,
  calcFilePartItemsBySize,
} from '@guanghechen/helper-file'
import { emptyDir, rm, writeFile } from '@guanghechen/helper-fs'
import { locateFixtures, unlinkSync } from 'jest.helper'
import { existsSync, readFileSync, statSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { IFileCipher } from '../src'
import { FileCipher } from '../src'

describe('FileCipher', () => {
  const workspaceDir: string = locateFixtures('__fictitious__.FileCipher')
  const logger = new ChalkLogger({ flags: { colorful: false, date: false } })
  const cipherFactory = new AesCipherFactory()
  let fileCipher: IFileCipher

  const fileHelper = new BigFileHelper()
  const sourceFilepath = locateFixtures('basic/big-file.md')
  const originalContent = readFileSync(sourceFilepath)
  let partFilepaths: string[] = []

  beforeAll(async () => {
    const secret = cipherFactory.createRandomSecret()
    const cipher = cipherFactory.initFromSecret(secret)
    fileCipher = new FileCipher({ cipher, logger })

    partFilepaths = await fileHelper.split(
      sourceFilepath,
      calcFilePartItemsByCount(statSync(sourceFilepath).size, 5),
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
      const cipherData: Buffer = await fileCipher.encryptFromFiles(partFilepaths)
      const plainData: Buffer = fileCipher.cipher.decrypt(cipherData)
      expect(plainData).toEqual(originalContent)
    }
  })

  test('decrypt from files', async () => {
    for (let i = 0; i < 3; ++i) {
      const cipherFilepath = sourceFilepath + '.cipher.' + Math.random()
      let cipherPartFilepaths: string[] | null = null

      try {
        expect(existsSync(cipherFilepath)).toBe(false)
        await fileCipher.encryptFile(sourceFilepath, cipherFilepath)
        expect(existsSync(cipherFilepath)).toBe(true)

        cipherPartFilepaths = await fileHelper.split(
          cipherFilepath,
          calcFilePartItemsByCount(statSync(cipherFilepath).size, 5),
        )
        expect(cipherPartFilepaths.length).toEqual(5)

        const plainData: Buffer = await fileCipher.decryptFromFiles(cipherPartFilepaths)
        expect(plainData).toEqual(originalContent)
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

        await fileCipher.encryptFile(filepath, cipherFilepath)
        await fileCipher.decryptFile(cipherFilepath, plainFilepath)

        expect(existsSync(plainFilepath)).toBe(true)
        expect(existsSync(cipherFilepath)).toBe(true)
        expect(readFileSync(plainFilepath)).toEqual(readFileSync(filepath))
      } finally {
        unlinkSync(plainFilepath, cipherFilepath)
      }
    }
  })

  test('encrypt files', async () => {
    await expect(fileCipher.encryptFiles([], 'a.txt')).resolves.not.toThrow()
    for (let i = 0; i < 3; ++i) {
      const plainFilepath = sourceFilepath + '.plain.' + Math.random()
      const cipherFilepath = sourceFilepath + '.cipher.' + Math.random()

      try {
        expect(plainFilepath).not.toEqual(cipherFilepath)
        expect(existsSync(plainFilepath)).toBe(false)
        expect(existsSync(cipherFilepath)).toBe(false)

        await fileCipher.encryptFiles([sourceFilepath], cipherFilepath)
        await fileCipher.decryptFile(cipherFilepath, plainFilepath)

        expect(existsSync(plainFilepath)).toBe(true)
        expect(existsSync(cipherFilepath)).toBe(true)
        expect(readFileSync(plainFilepath)).toEqual(originalContent)
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

        await fileCipher.encryptFiles(partFilepaths, cipherFilepath)
        await fileCipher.decryptFile(cipherFilepath, plainFilepath)

        expect(existsSync(plainFilepath)).toBe(true)
        expect(existsSync(cipherFilepath)).toBe(true)
        expect(readFileSync(plainFilepath)).toEqual(originalContent)
      } finally {
        unlinkSync(plainFilepath, cipherFilepath)
      }
    }
  })

  test('decrypt files', async () => {
    await expect(fileCipher.decryptFiles([], 'a.txt')).resolves.not.toThrow()
    for (let i = 0; i < 3; ++i) {
      const plainFilepath = sourceFilepath + '.plain.' + Math.random()
      const cipherFilepath = sourceFilepath + '.cipher.' + Math.random()

      try {
        expect(plainFilepath).not.toEqual(cipherFilepath)
        expect(existsSync(plainFilepath)).toBe(false)
        expect(existsSync(cipherFilepath)).toBe(false)

        await fileCipher.encryptFile(sourceFilepath, cipherFilepath)
        await fileCipher.decryptFiles([cipherFilepath], plainFilepath)

        expect(existsSync(plainFilepath)).toBe(true)
        expect(existsSync(cipherFilepath)).toBe(true)
        expect(readFileSync(plainFilepath)).toEqual(originalContent)
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

        await fileCipher.encryptFile(sourceFilepath, cipherFilepath)
        expect(existsSync(cipherFilepath)).toBe(true)

        await fileCipher.decryptFile(cipherFilepath, plainFilepath)
        expect(existsSync(plainFilepath)).toBe(true)
        expect(readFileSync(plainFilepath)).toEqual(originalContent)

        cipherPartFilepaths = await fileHelper.split(
          cipherFilepath,
          calcFilePartItemsByCount(statSync(cipherFilepath).size, 5),
        )
        expect(cipherPartFilepaths.length).toEqual(5)

        await fileHelper.merge(cipherPartFilepaths, cipherFilepath2)
        expect(existsSync(cipherFilepath2)).toBe(true)

        await fileCipher.decryptFile(cipherFilepath2, plainFilepath2)
        expect(existsSync(plainFilepath2)).toBe(true)
        expect(readFileSync(plainFilepath2)).toEqual(originalContent)

        await fileCipher.decryptFiles(cipherPartFilepaths, plainFilepath3)
        expect(existsSync(plainFilepath3)).toBe(true)
        expect(readFileSync(plainFilepath3)).toEqual(originalContent)
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
    await fileCipher.encryptFile(plainFilepath, cryptFilepath)
    const cryptContent: Buffer = await fs.readFile(cryptFilepath)

    await fileCipher.decryptFile(cryptFilepath, plain2Filepath)
    const plain2Content = await fs.readFile(plain2Filepath, encoding)
    expect(plain2Content).toEqual(plainContent)

    const cryptParts = calcFilePartItemsBySize(statSync(cryptFilepath).size, 1024)
    const cryptPartsFilepaths = await fileHelper.split(cryptFilepath, cryptParts)

    await fileHelper.merge(cryptPartsFilepaths, crypt2Filepath)
    const crypt2Content: Buffer = await fs.readFile(crypt2Filepath)
    expect(crypt2Content).toEqual(cryptContent)

    await fileCipher.decryptFiles(cryptPartsFilepaths, plain3Filepath)
    const plain3Content = await fs.readFile(plain3Filepath, encoding)
    expect(plain3Content).toEqual(plainContent)
  })
})
