import { ChalkLogger, Level } from '@guanghechen/chalk-logger'
import { AesCipherFactory } from '@guanghechen/helper-cipher'
import {
  FileCipher,
  FileCipherBatcher,
  FileCipherCatalog,
  FileCipherPathResolver,
} from '@guanghechen/helper-cipher-file'
import { BigFileHelper } from '@guanghechen/helper-file'
import { collectAllFilesSync, emptyDir, rm } from '@guanghechen/helper-fs'
import type { ILoggerMock } from '@guanghechen/helper-jest'
import { createLoggerMock } from '@guanghechen/helper-jest'
import { locateFixtures } from 'jest.helper'
import fs from 'node:fs/promises'
import path from 'node:path'
import { GitCipher, GitCipherConfig, decryptFilesOnly } from '../src'
import {
  buildRepo1,
  contentA,
  contentA2,
  contentB,
  contentB2,
  contentC,
  contentC2,
  contentC3,
  contentD,
  encoding,
  encryptedFilesDir,
  fpA,
  fpB,
  fpC,
  fpD,
  fpE,
  maxTargetFileSize,
  partCodePrefix,
  repo1CryptCommitIdTable,
} from './_data-repo1'

describe('decryptFilesOnly', () => {
  const workspaceDir: string = locateFixtures('__fictitious__decryptFilesOnly')
  const plainRootDir: string = path.join(workspaceDir, 'plain')
  const cryptRootDir: string = path.join(workspaceDir, 'crypt')
  const bakRootDir: string = path.join(workspaceDir, 'plain_bak')
  const pathResolver = new FileCipherPathResolver({ plainRootDir, cryptRootDir })
  const bakPathResolver = new FileCipherPathResolver({ plainRootDir: bakRootDir, cryptRootDir })
  const logger = new ChalkLogger({
    name: 'decryptFilesOnly',
    level: Level.ERROR,
    flags: { inline: true, colorful: false },
  })

  const fileHelper = new BigFileHelper({ partCodePrefix })
  const cipherFactory = new AesCipherFactory()
  const cipher = cipherFactory.initFromPassword(Buffer.from('guanghechen', encoding), {
    salt: 'salt',
    iterations: 100000,
    keylen: 32,
    digest: 'sha256',
  })
  const fileCipher = new FileCipher({ cipher })
  const cipherBatcher = new FileCipherBatcher({
    fileCipher,
    fileHelper,
    maxTargetFileSize,
    logger,
  })

  const configKeeper = new GitCipherConfig({
    cipher,
    filepath: path.join(cryptRootDir, 'catalog.ghc.txt'),
  })
  const gitCipher = new GitCipher({ cipherBatcher, configKeeper, logger })

  const catalog = new FileCipherCatalog({
    pathResolver,
    encryptedFilesDir,
    encryptedFilePathSalt: 'guanghechen_git_cipher',
    maxTargetFileSize,
    partCodePrefix,
    logger,
    isKeepPlain: sourceFilepath => sourceFilepath === 'a.txt',
  })

  const bakFilepathA: string = bakPathResolver.calcAbsolutePlainFilepath(fpA)
  const bakFilepathB: string = bakPathResolver.calcAbsolutePlainFilepath(fpB)
  const bakFilepathC: string = bakPathResolver.calcAbsolutePlainFilepath(fpC)
  const bakFilepathD: string = bakPathResolver.calcAbsolutePlainFilepath(fpD)
  const bakFilepathE: string = bakPathResolver.calcAbsolutePlainFilepath(fpE)

  let logMock: ILoggerMock
  beforeAll(async () => {
    logMock = createLoggerMock({ logger })
    await emptyDir(workspaceDir)
    await buildRepo1({ repoDir: plainRootDir, logger, execaOptions: {} })
    await gitCipher.encrypt({ catalog, pathResolver, crypt2plainIdMap: new Map() })
  })
  afterAll(async () => {
    await configKeeper.remove()
    await rm(workspaceDir)
    logMock.restore()
  })
  beforeEach(async () => {
    await emptyDir(bakRootDir)
  })

  const decryptAt = (cryptCommitId: string): Promise<void> =>
    decryptFilesOnly({
      cryptCommitId,
      cipherBatcher,
      pathResolver: bakPathResolver,
      configKeeper,
      logger,
    })

  test('A', async () => {
    await decryptAt(repo1CryptCommitIdTable.A)
    const files: string[] = collectAllFilesSync(bakRootDir, () => true)
    expect(files.sort()).toEqual([bakFilepathA, bakFilepathB])
    expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA)
    expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
  })

  test('B', async () => {
    await decryptAt(repo1CryptCommitIdTable.B)
    const files: string[] = collectAllFilesSync(bakRootDir, () => true)
    expect(files.sort()).toEqual([bakFilepathA, bakFilepathB, bakFilepathC])
    expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA2)
    expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
    expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC)
  })

  test('C', async () => {
    await decryptAt(repo1CryptCommitIdTable.C)
    const files: string[] = collectAllFilesSync(bakRootDir, () => true)
    expect(files.sort()).toEqual([bakFilepathB, bakFilepathC])
    expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
    expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC)
  })

  test('D', async () => {
    await decryptAt(repo1CryptCommitIdTable.D)
    const files: string[] = collectAllFilesSync(bakRootDir, () => true)
    expect(files.sort()).toEqual([bakFilepathA, bakFilepathB, bakFilepathC])
    expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA)
    expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
    expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC2)
  })

  test('E', async () => {
    await decryptAt(repo1CryptCommitIdTable.E)
    const files: string[] = collectAllFilesSync(bakRootDir, () => true)
    expect(files.sort()).toEqual([bakFilepathC])
    expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC2)
  })

  test('F', async () => {
    await decryptAt(repo1CryptCommitIdTable.F)
    const files: string[] = collectAllFilesSync(bakRootDir, () => true)
    expect(files.sort()).toEqual([bakFilepathA, bakFilepathC])
    expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA)
    expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC2)
  })

  test('G', async () => {
    await decryptAt(repo1CryptCommitIdTable.G)
    const files: string[] = collectAllFilesSync(bakRootDir, () => true)
    expect(files.sort()).toEqual([bakFilepathA, bakFilepathB, bakFilepathC])
    expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA2)
    expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB2)
    expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC3)
  })

  test('H', async () => {
    await decryptAt(repo1CryptCommitIdTable.H)
    const files: string[] = collectAllFilesSync(bakRootDir, () => true)
    expect(files.sort()).toEqual([bakFilepathB, bakFilepathC])
    expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB2)
    expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC3)
  })

  test('I', async () => {
    await decryptAt(repo1CryptCommitIdTable.I)
    const files: string[] = collectAllFilesSync(bakRootDir, () => true)
    expect(files.sort()).toEqual([bakFilepathA, bakFilepathB, bakFilepathC, bakFilepathD])
    expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA2)
    expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
    expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC3)
    expect(await fs.readFile(bakFilepathD, encoding)).toEqual(contentD)
  })

  test('J', async () => {
    await decryptAt(repo1CryptCommitIdTable.J)
    const files: string[] = collectAllFilesSync(bakRootDir, () => true)
    expect(files.sort()).toEqual([bakFilepathA, bakFilepathB, bakFilepathC, bakFilepathD])
    expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA)
    expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
    expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC3)
    expect(await fs.readFile(bakFilepathD, encoding)).toEqual(contentD)
  })

  test('K', async () => {
    await decryptAt(repo1CryptCommitIdTable.K)
    const files: string[] = collectAllFilesSync(bakRootDir, () => true)
    expect(files.sort()).toEqual([bakFilepathA, bakFilepathB, bakFilepathC, bakFilepathE])
    expect(await fs.readFile(bakFilepathA, encoding)).toEqual(contentA)
    expect(await fs.readFile(bakFilepathB, encoding)).toEqual(contentB)
    expect(await fs.readFile(bakFilepathC, encoding)).toEqual(contentC3)
    expect(await fs.readFile(bakFilepathE, encoding)).toEqual(contentD)
  })
})
