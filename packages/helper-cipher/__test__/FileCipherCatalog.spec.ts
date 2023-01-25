import { BigFileHelper } from '@guanghechen/helper-file'
import { emptyDir, mkdirsIfNotExists, rm, writeFile } from '@guanghechen/helper-fs'
import { locateFixtures } from 'jest.helper'
import { existsSync, readFileSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { IFileCipherCatalogItem } from '../src'
import {
  AesCipherFactory,
  FileChangeType,
  FileCipher,
  FileCipherCatalog,
  FileCipherPathResolver,
  calcFileCipherCatalogItem,
} from '../src'

describe('FileCipherCatalog', () => {
  const workspaceDir: string = locateFixtures('__fictitious__')
  const sourceRootDir: string = path.join(workspaceDir, 'src')
  const encryptedRootDir: string = path.join(workspaceDir, 'src_encrypted')
  const pathResolver = new FileCipherPathResolver({ sourceRootDir, encryptedRootDir })
  const encoding: BufferEncoding = 'utf8'
  const filepathA: string = pathResolver.calcAbsoluteSourceFilepath('a.txt')
  const filepathB: string = pathResolver.calcAbsoluteSourceFilepath('b.txt')
  const filepathC: string = pathResolver.calcAbsoluteSourceFilepath('x/y/z/c.txt')

  const fileHelper = new BigFileHelper({ partSuffix: '.ghc-', encoding: 'utf8' })
  const cipherFactory = new AesCipherFactory()
  const cipher = cipherFactory.initFromPassword(Buffer.from('guanghechen', 'utf8'), {
    salt: 'salt',
    iterations: 100000,
    keylen: 32,
    digest: 'sha256',
  })
  const fileCipher = new FileCipher({ cipher })
  const catalog = new FileCipherCatalog({
    pathResolver,
    fileCipher,
    fileHelper,
    maxTargetFileSize: 1024,
  })

  const calcCatalogItem = (
    sourceFilepath: string,
    keepPlain: boolean,
  ): Promise<IFileCipherCatalogItem | never> => {
    return calcFileCipherCatalogItem(sourceFilepath, {
      keepPlain,
      maxTargetSize: catalog.maxTargetFileSize,
      partCodePrefix: '.ghc-',
      pathResolver,
    })
  }

  const compareCatalogItem = (x: IFileCipherCatalogItem, y: IFileCipherCatalogItem): number =>
    x.sourceFilepath.localeCompare(y.sourceFilepath)

  beforeEach(async () => {
    await emptyDir(workspaceDir, true)
  })

  afterEach(async () => {
    await rm(workspaceDir)
  })

  test('encryptDiff', async () => {
    expect(existsSync(filepathA)).toEqual(false)
    expect(existsSync(filepathB)).toEqual(false)
    expect(existsSync(filepathC)).toEqual(false)

    await writeFile(filepathA, 'Hello, A', encoding)
    await writeFile(filepathB, 'Hello, B', encoding)
    expect(existsSync(filepathA)).toEqual(true)
    expect(existsSync(filepathB)).toEqual(true)
    expect(catalog.currentItems.sort(compareCatalogItem)).toEqual([])

    {
      const itemA = await calcCatalogItem(filepathA, false)
      const itemB = await calcCatalogItem(filepathB, false)

      await catalog.encryptDiff([
        {
          changeType: FileChangeType.ADDED,
          newItem: itemA,
        },
        {
          changeType: FileChangeType.ADDED,
          newItem: itemB,
        },
      ])

      const absoluteEncryptedFilepathA = pathResolver.calcAbsoluteEncryptedFilepath(
        itemA.encryptedFilepath,
      )
      const absoluteEncryptedFilepathB = pathResolver.calcAbsoluteEncryptedFilepath(
        itemB.encryptedFilepath,
      )

      expect(existsSync(absoluteEncryptedFilepathA)).toEqual(true)
      expect(readFileSync(absoluteEncryptedFilepathA, 'base64')).toEqual('YnpQiVlEtZY=')
      expect(existsSync(absoluteEncryptedFilepathB)).toEqual(true)
      expect(readFileSync(absoluteEncryptedFilepathB, 'base64')).toEqual('YnpQiVlEtZU=')
      expect(catalog.currentItems.sort(compareCatalogItem)).toEqual(
        [itemA, itemB].sort(compareCatalogItem),
      )

      await expect(() =>
        catalog.encryptDiff([
          {
            changeType: FileChangeType.REMOVED,
            oldItem: itemA,
          },
        ]),
      ).rejects.toThrow('[encryptDiff] Bad diff item (removed), source file should not exist.')

      expect(catalog.currentItems.sort(compareCatalogItem)).toEqual(
        [itemA, itemB].sort(compareCatalogItem),
      )

      await fs.unlink(filepathA)
      await catalog.encryptDiff([
        {
          changeType: FileChangeType.REMOVED,
          oldItem: itemA,
        },
      ])

      expect(catalog.currentItems.sort(compareCatalogItem)).toEqual([itemB])
      expect(existsSync(absoluteEncryptedFilepathA)).toEqual(false)
      expect(existsSync(absoluteEncryptedFilepathB)).toEqual(true)
      expect(readFileSync(absoluteEncryptedFilepathB, 'base64')).toEqual('YnpQiVlEtZU=')

      await expect(() =>
        catalog.encryptDiff([
          {
            changeType: FileChangeType.MODIFIED,
            oldItem: itemA,
            newItem: itemA,
          },
        ]),
      ).rejects.toThrow(
        '[encryptDiff] Bad diff item (modified), encrypted file does not exist or it is not a file.',
      )

      await writeFile(filepathB, 'Hello, B2', encoding)
      const itemB2 = await calcCatalogItem(filepathB, true)
      await catalog.encryptDiff([
        {
          changeType: FileChangeType.MODIFIED,
          oldItem: itemB,
          newItem: itemB2,
        },
      ])

      expect(catalog.currentItems.sort(compareCatalogItem)).toEqual([itemB2])
      expect(existsSync(absoluteEncryptedFilepathA)).toEqual(false)
      expect(existsSync(absoluteEncryptedFilepathB)).toEqual(true)
      expect(readFileSync(absoluteEncryptedFilepathB, encoding)).toEqual('Hello, B2')

      const contentC = 'waw'.repeat(1037).concat('1234@123589op#kdf%df')
      await writeFile(filepathC, contentC, encoding)
      const itemC = await calcCatalogItem(filepathC, false)
      await catalog.encryptDiff([
        {
          changeType: FileChangeType.ADDED,
          newItem: itemC,
        },
      ])

      expect(catalog.currentItems.sort(compareCatalogItem)).toEqual([itemB2, itemC])
      expect(existsSync(absoluteEncryptedFilepathA)).toEqual(false)
      expect(existsSync(absoluteEncryptedFilepathB)).toEqual(true)
      expect(readFileSync(absoluteEncryptedFilepathB, encoding)).toEqual('Hello, B2')
    }
  })

  test('decryptDiff', async () => {
    const bakRootDir: string = path.join(workspaceDir, 'src_backup')
    const pathResolver2 = new FileCipherPathResolver({
      sourceRootDir: bakRootDir,
      encryptedRootDir,
    })
    const catalog2 = new FileCipherCatalog({
      pathResolver: pathResolver2,
      fileCipher,
      fileHelper,
      maxTargetFileSize: 1024,
    })

    expect(existsSync(filepathA)).toEqual(false)

    await writeFile(filepathA, 'Hello, Alice')
    const itemA = catalog

    await catalog.encryptDiff()
  })
})
