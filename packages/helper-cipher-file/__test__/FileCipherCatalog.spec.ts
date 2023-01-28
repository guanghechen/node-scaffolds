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
    partCodePrefix: '.ghc-',
    maxTargetFileSize: 1024,
    isKeepPlain: () => false,
  })

  const calcCatalogItem = (
    sourceFilepath: string,
    keepPlain: boolean,
    pathResolver: FileCipherPathResolver,
  ): Promise<IFileCipherCatalogItem | never> => {
    return calcFileCipherCatalogItem(sourceFilepath, {
      keepPlain,
      maxTargetFileSize: catalog.maxTargetFileSize,
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

      await catalog.encryptDiff({
        diffItems: [
          {
            changeType: FileChangeType.ADDED,
            newItem: itemA,
          },
          {
            changeType: FileChangeType.ADDED,
            newItem: itemB,
          },
        ],
      })
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
        catalog.encryptDiff({
          diffItems: [
            {
              changeType: FileChangeType.REMOVED,
              oldItem: itemA,
            },
          ],
        }),
      ).rejects.toThrow('[encryptDiff] Bad diff item (removed), source file should not exist.')
      await expect(
        catalog.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
      ).resolves.toBeUndefined()

      expect(catalog.currentItems.sort(compareCatalogItem)).toEqual(
        [itemA, itemB].sort(compareCatalogItem),
      )

      await fs.unlink(filepathA)
      await catalog.encryptDiff({
        diffItems: [
          {
            changeType: FileChangeType.REMOVED,
            oldItem: itemA,
          },
        ],
      })
      await expect(
        catalog.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
      ).resolves.toBeUndefined()

      expect(catalog.currentItems.sort(compareCatalogItem)).toEqual([itemB])
      expect(existsSync(absoluteEncryptedFilepathA)).toEqual(false)
      expect(existsSync(absoluteEncryptedFilepathB)).toEqual(true)
      expect(readFileSync(absoluteEncryptedFilepathB, 'base64')).toEqual('YnpQiVlEtZU=')

      await expect(() =>
        catalog.encryptDiff({
          diffItems: [
            {
              changeType: FileChangeType.MODIFIED,
              oldItem: itemA,
              newItem: itemA,
            },
          ],
        }),
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

      await catalog.encryptDiff({
        diffItems: [
          {
            changeType: FileChangeType.MODIFIED,
            oldItem: itemB,
            newItem: itemB2,
          },
        ],
      })
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
      await catalog.encryptDiff({
        diffItems: [
          {
            changeType: FileChangeType.ADDED,
            newItem: itemC,
          },
        ],
      })
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
      partCodePrefix: '.ghc-',
      initialItems: [],
      logger,
      isKeepPlain: () => false,
    })

    expect(existsSync(filepathA)).toEqual(false)

    await writeFile(filepathA, 'Hello, Alice')
    const itemA = await calcCatalogItem(filepathA, false, pathResolver)

    await catalog.encryptDiff({
      diffItems: [
        {
          changeType: FileChangeType.ADDED,
          newItem: itemA,
        },
      ],
    })

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
    await catalog.encryptDiff({
      diffItems: [
        {
          changeType: FileChangeType.ADDED,
          newItem: itemC,
        },
      ],
    })
    await expect(
      catalog.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
    ).resolves.toBeUndefined()

    await catalog2.decryptDiff({
      diffItems: [
        {
          changeType: FileChangeType.ADDED,
          newItem: itemA,
        },
        {
          changeType: FileChangeType.ADDED,
          newItem: itemC,
        },
      ],
    })
    await expect(
      catalog2.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
    ).resolves.toBeUndefined()

    await expect(() =>
      catalog2.decryptDiff({
        diffItems: [
          {
            changeType: FileChangeType.REMOVED,
            oldItem: itemA,
          },
        ],
      }),
    ).rejects.toThrow('Bad diff item (REMOVED), encrypted file should not exist.')

    await writeFile(filepathB, 'Hello, B', encoding)

    const itemB = await calcCatalogItem(filepathB, true, pathResolver)
    await catalog.encryptDiff({
      diffItems: [
        {
          changeType: FileChangeType.ADDED,
          newItem: itemB,
        },
      ],
    })
    await expect(
      catalog.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
    ).resolves.toBeUndefined()

    await fs.unlink(absoluteEncryptedFilepathA)
    await catalog2.decryptDiff({
      diffItems: [
        {
          changeType: FileChangeType.REMOVED,
          oldItem: itemA,
        },
        {
          changeType: FileChangeType.ADDED,
          newItem: itemB,
        },
      ],
    })
    await expect(
      catalog2.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
    ).resolves.toBeUndefined()

    await writeFile(filepathB, 'Hello, B2', encoding)
    await catalog.encryptDiff({
      diffItems: [
        {
          changeType: FileChangeType.MODIFIED,
          oldItem: itemB,
          newItem: itemB,
        },
      ],
    })
    await catalog2.decryptDiff({
      diffItems: [
        {
          changeType: FileChangeType.MODIFIED,
          oldItem: itemB,
          newItem: itemB,
        },
      ],
    })
    await expect(
      catalog2.checkIntegrity({ sourceFiles: true, encryptedFiles: true }),
    ).resolves.toBeUndefined()
  })

  test('calcDiffItems', async () => {
    await writeFile(filepathA, 'calcDiffItem -- A')
    await writeFile(filepathB, 'calcDiffItem -- B')
    await writeFile(
      filepathC,
      'calcDiffItem -- C' + '\n\n' + 'waw'.repeat(1037).concat('1234@123589op#kdf%df'),
    )

    expect(catalog.currentItems).toEqual([])
    const diffItems0 = await catalog.calcDiffItems({
      sourceFilepaths: [filepathA, filepathB, filepathC],
      isKeepPlain: sourceFilepath => sourceFilepath === 'a.txt',
    })
    expect(diffItems0).toEqual([
      {
        changeType: 'added',
        newItem: {
          encryptedFileParts: [],
          encryptedFilepath: 'a.txt',
          fingerprint: '34a335b78403b1a8b999660d1ea09b7f4216caf168375b24cd4c829f91d8f526',
          keepPlain: true,
          size: 17,
          sourceFilepath: 'a.txt',
        },
      },
      {
        changeType: 'added',
        newItem: {
          encryptedFileParts: [],
          encryptedFilepath: 'ffa0da5d885fba09d903c782713b6b098c8cf21f56a3a35d9aa920613220d2e1',
          fingerprint: 'f0bc768976a104c91563c968b6689402f170e14d6e5dad0921324307f1188d0c',
          keepPlain: false,
          size: 17,
          sourceFilepath: 'b.txt',
        },
      },
      {
        changeType: 'added',
        newItem: {
          encryptedFileParts: ['.ghc-1', '.ghc-2', '.ghc-3', '.ghc-4'],
          encryptedFilepath: '23a6a53bcf2e6e958b115c487e09d8b693c38e93ed5643fda471261a959ad696',
          fingerprint: 'c32be2b29983d1e0ee9570f15371d3900e6df8e4dc3ffb3d6138760f6c71fbb8',
          keepPlain: false,
          size: 3150,
          sourceFilepath: 'x/y/z/c.txt',
        },
      },
    ])

    expect(catalog.currentItems).toEqual([])
    await catalog.encryptDiff({ diffItems: diffItems0 })
    expect(catalog.currentItems).toEqual(diffItems0.map(diffItem => (diffItem as any).newItem))

    await rm(filepathA)
    await writeFile(filepathB, 'calcDiffItem -- B2')
    const diffItems1 = await catalog.calcDiffItems({
      sourceFilepaths: [filepathA, filepathB, filepathC],
      isKeepPlain: sourceFilepath => sourceFilepath === 'a.txt',
    })
    expect(diffItems1).toEqual([
      {
        changeType: 'removed',
        oldItem: {
          encryptedFileParts: [],
          encryptedFilepath: 'a.txt',
          fingerprint: '34a335b78403b1a8b999660d1ea09b7f4216caf168375b24cd4c829f91d8f526',
          keepPlain: true,
          size: 17,
          sourceFilepath: 'a.txt',
        },
      },
      {
        changeType: 'modified',
        newItem: {
          encryptedFileParts: [],
          encryptedFilepath: 'ffa0da5d885fba09d903c782713b6b098c8cf21f56a3a35d9aa920613220d2e1',
          fingerprint: '3110b27a86a4d8902b66535b090b29d2713dad041409efa3f191f04b885aa3f6',
          keepPlain: false,
          size: 18,
          sourceFilepath: 'b.txt',
        },
        oldItem: {
          encryptedFileParts: [],
          encryptedFilepath: 'ffa0da5d885fba09d903c782713b6b098c8cf21f56a3a35d9aa920613220d2e1',
          fingerprint: 'f0bc768976a104c91563c968b6689402f170e14d6e5dad0921324307f1188d0c',
          keepPlain: false,
          size: 17,
          sourceFilepath: 'b.txt',
        },
      },
    ])

    expect(catalog.currentItems).toEqual(diffItems0.map(diffItem => (diffItem as any).newItem))
    await catalog.encryptDiff({ diffItems: diffItems1 })
    expect(catalog.currentItems).toEqual([
      {
        encryptedFileParts: ['.ghc-1', '.ghc-2', '.ghc-3', '.ghc-4'],
        encryptedFilepath: '23a6a53bcf2e6e958b115c487e09d8b693c38e93ed5643fda471261a959ad696',
        fingerprint: 'c32be2b29983d1e0ee9570f15371d3900e6df8e4dc3ffb3d6138760f6c71fbb8',
        keepPlain: false,
        size: 3150,
        sourceFilepath: 'x/y/z/c.txt',
      },
      {
        encryptedFileParts: [],
        encryptedFilepath: 'ffa0da5d885fba09d903c782713b6b098c8cf21f56a3a35d9aa920613220d2e1',
        fingerprint: '3110b27a86a4d8902b66535b090b29d2713dad041409efa3f191f04b885aa3f6',
        keepPlain: false,
        size: 18,
        sourceFilepath: 'b.txt',
      },
    ])

    await writeFile(filepathA, 'calcDiffItem -- A3')
    const diffItems2 = await catalog.calcDiffItems({ sourceFilepaths: [filepathA] })
    expect(diffItems2).toEqual([
      {
        changeType: 'added',
        newItem: {
          encryptedFileParts: [],
          encryptedFilepath: '18b7cb099a9ea3f50ba899b5ba81e0d377a5f3b16f8f6eeb8b3e58cd4692b993',
          fingerprint: 'ef7275bcbc9724a87f01543803e927cff591aac25bb0845099b4434bb5ac73fe',
          keepPlain: false,
          size: 18,
          sourceFilepath: 'a.txt',
        },
      },
    ])
  })
})
