import ChalkLogger from '@guanghechen/chalk-logger'
import { AesCipherFactory } from '@guanghechen/helper-cipher'
import { BigFileHelper } from '@guanghechen/helper-file'
import { emptyDir, rm, writeFile } from '@guanghechen/helper-fs'
import { locateFixtures } from 'jest.helper'
import { existsSync, readFileSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { IFileCipherCatalogItem } from '../src'
import {
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
  const bakRootDir: string = path.join(workspaceDir, 'src_backup')
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
    pathResolver: FileCipherPathResolver,
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
    catalog.clear()
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
      const itemA = await calcCatalogItem(filepathA, false, pathResolver)
      const itemB = await calcCatalogItem(filepathB, false, pathResolver)

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
      await expect(
        catalog.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
      ).resolves.toBeUndefined()

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
      await expect(
        catalog.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
      ).resolves.toBeUndefined()

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
      await expect(
        catalog.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
      ).resolves.toBeUndefined()

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
      await expect(
        catalog.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
      ).resolves.toBeUndefined()

      await writeFile(filepathB, 'Hello, B2', encoding)
      const itemB2 = await calcCatalogItem(filepathB, true, pathResolver)
      const absoluteEncryptedFilepathB2 = pathResolver.calcAbsoluteEncryptedFilepath(
        itemB2.encryptedFilepath,
      )

      await catalog.encryptDiff([
        {
          changeType: FileChangeType.MODIFIED,
          oldItem: itemB,
          newItem: itemB2,
        },
      ])
      await expect(
        catalog.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
      ).resolves.toBeUndefined()

      expect(catalog.currentItems.sort(compareCatalogItem)).toEqual([itemB2])
      expect(existsSync(absoluteEncryptedFilepathA)).toEqual(false)
      expect(existsSync(absoluteEncryptedFilepathB)).toEqual(false)
      expect(existsSync(absoluteEncryptedFilepathB2)).toEqual(true)
      expect(readFileSync(absoluteEncryptedFilepathB2, encoding)).toEqual('Hello, B2')

      const contentC = 'waw'.repeat(1037).concat('1234@123589op#kdf%df')
      await writeFile(filepathC, contentC, encoding)
      const itemC = await calcCatalogItem(filepathC, false, pathResolver)
      await catalog.encryptDiff([
        {
          changeType: FileChangeType.ADDED,
          newItem: itemC,
        },
      ])
      await expect(
        catalog.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
      ).resolves.toBeUndefined()

      expect(catalog.currentItems.sort(compareCatalogItem)).toEqual([itemB2, itemC])
      expect(existsSync(absoluteEncryptedFilepathA)).toEqual(false)
      expect(existsSync(absoluteEncryptedFilepathB2)).toEqual(true)
      expect(readFileSync(absoluteEncryptedFilepathB2, encoding)).toEqual('Hello, B2')
    }
  })

  test('decryptDiff', async () => {
    const pathResolver2 = new FileCipherPathResolver({
      sourceRootDir: bakRootDir,
      encryptedRootDir,
    })

    const logger = new ChalkLogger({ flags: { colorful: false, date: false } })
    const catalog2 = new FileCipherCatalog({
      pathResolver: pathResolver2,
      fileCipher,
      fileHelper,
      maxTargetFileSize: 1024,
      initialItems: [],
      logger,
    })

    expect(existsSync(filepathA)).toEqual(false)

    await writeFile(filepathA, 'Hello, Alice')
    const itemA = await calcCatalogItem(filepathA, false, pathResolver)

    await catalog.encryptDiff([
      {
        changeType: FileChangeType.ADDED,
        newItem: itemA,
      },
    ])

    await expect(
      catalog.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
    ).resolves.toBeUndefined()

    const absoluteEncryptedFilepathA = pathResolver.calcAbsoluteEncryptedFilepath(
      itemA.encryptedFilepath,
    )
    const contentA = await fs.readFile(absoluteEncryptedFilepathA)
    await fs.unlink(absoluteEncryptedFilepathA)
    await expect(catalog.checkIntegrity({ sourceFiles: true })).resolves.toBeUndefined()
    await expect(() => catalog.checkIntegrity({ encryptedFiles: true })).rejects.toThrow(
      'Missing encrypted file.',
    )
    await writeFile(absoluteEncryptedFilepathA, contentA)

    await expect(
      catalog.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
    ).resolves.toBeUndefined()

    const contentC = 'waw'.repeat(1037).concat('1234@123589op#kdf%df')
    await writeFile(filepathC, contentC, encoding)
    const itemC = await calcCatalogItem(filepathC, false, pathResolver)
    await catalog.encryptDiff([
      {
        changeType: FileChangeType.ADDED,
        newItem: itemC,
      },
    ])
    await expect(
      catalog.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
    ).resolves.toBeUndefined()

    await catalog2.decryptDiff([
      {
        changeType: FileChangeType.ADDED,
        newItem: itemA,
      },
      {
        changeType: FileChangeType.ADDED,
        newItem: itemC,
      },
    ])
    await expect(
      catalog2.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
    ).resolves.toBeUndefined()

    await expect(() =>
      catalog2.decryptDiff([
        {
          changeType: FileChangeType.REMOVED,
          oldItem: itemA,
        },
      ]),
    ).rejects.toThrow('Bad diff item (REMOVED), encrypted file should not exist.')

    await writeFile(filepathB, 'Hello, B', encoding)

    const itemB = await calcCatalogItem(filepathB, true, pathResolver)
    await catalog.encryptDiff([
      {
        changeType: FileChangeType.ADDED,
        newItem: itemB,
      },
    ])
    await expect(
      catalog.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
    ).resolves.toBeUndefined()

    await fs.unlink(absoluteEncryptedFilepathA)
    await catalog2.decryptDiff([
      {
        changeType: FileChangeType.REMOVED,
        oldItem: itemA,
      },
      {
        changeType: FileChangeType.ADDED,
        newItem: itemB,
      },
    ])
    await expect(
      catalog2.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
    ).resolves.toBeUndefined()

    await writeFile(filepathB, 'Hello, B2', encoding)
    await catalog.encryptDiff([
      {
        changeType: FileChangeType.MODIFIED,
        oldItem: itemB,
        newItem: itemB,
      },
    ])
    await catalog2.decryptDiff([
      {
        changeType: FileChangeType.MODIFIED,
        oldItem: itemB,
        newItem: itemB,
      },
    ])
    await expect(
      catalog2.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
    ).resolves.toBeUndefined()
  })
})
