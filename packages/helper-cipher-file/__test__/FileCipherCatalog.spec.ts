// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import { AesGcmCipherFactoryBuilder } from '@guanghechen/cipher'
import { areSameDraftCatalogItem } from '@guanghechen/cipher-catalog'
import type {
  ICatalogDiffItem,
  ICipherCatalogContext,
  IDraftCatalogDiffItem,
  IDraftCatalogItem,
} from '@guanghechen/cipher-catalog'
import { FileSplitter } from '@guanghechen/file-split'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import { Reporter } from '@guanghechen/reporter'
import {
  assertPromiseNotThrow,
  assertPromiseThrow,
  emptyDir,
  locateFixtures,
  rm,
  writeFile,
} from 'jest.helper'
import path from 'node:path'
import { FileCipherBatcher, FileCipherCatalog, FileCipherFactory } from '../src'
import {
  PATH_HASH_ALGORITHM,
  contentHashAlgorithm,
  contentTable,
  cryptFilesDir,
  diffItemsTable,
  encoding,
  itemDraftTable,
  itemTable,
  maxTargetFileSize,
  partCodePrefix,
} from './_data'

describe('FileCipherCatalog', () => {
  const workspaceDir: string = locateFixtures('__fictitious__.FileCipherCatalog')
  const plainRootDir: string = path.join(workspaceDir, 'src')
  const cryptRootDir: string = path.join(workspaceDir, 'src_encrypted')
  const plainPathResolver = new WorkspacePathResolver(plainRootDir, pathResolver)
  const cryptPathResolver = new WorkspacePathResolver(cryptRootDir, pathResolver)
  const reporter = new Reporter(chalk, { baseName: 'FileCipherCatalog' })

  const filepathA: string = plainPathResolver.resolve(itemTable.A.plainFilepath)
  const filepathB: string = plainPathResolver.resolve(itemTable.B.plainFilepath)
  const filepathC: string = plainPathResolver.resolve(itemTable.C.plainFilepath)
  const filepathD: string = plainPathResolver.resolve(itemTable.D.plainFilepath)

  const contentA: string = contentTable.A
  const contentA2: string = contentTable.A2
  const contentB: string = contentTable.B
  const contentC: string = contentTable.C
  const contentD: string = contentTable.D

  const catalogContext: ICipherCatalogContext = {
    cryptFilesDir,
    cryptFilepathSalt: 'guanghechen',
    maxTargetFileSize,
    partCodePrefix,
    contentHashAlgorithm: contentHashAlgorithm,
    PATH_HASH_ALGORITHM: PATH_HASH_ALGORITHM,
    plainPathResolver,
    cryptPathResolver,
    isKeepPlain: sourceFilepath => sourceFilepath === 'a.txt',
    calcIv: async (item: IDraftCatalogItem): Promise<Uint8Array | undefined> =>
      Object.values(itemTable).find(t => areSameDraftCatalogItem(t, item))?.iv,
  }
  const catalog = new FileCipherCatalog(catalogContext)

  beforeEach(async () => {
    const originalCalcCatalogItem = catalog.calcCatalogItem.bind(catalog)
    catalog.calcCatalogItem = async function (
      plainFilePath: string,
    ): Promise<IDraftCatalogItem | never> {
      const result = await originalCalcCatalogItem(plainFilePath)
      return { ...result, ctime: 0, mtime: 0 }
    }

    catalog.reset()
    await emptyDir(workspaceDir)
  })

  afterEach(async () => {
    await rm(workspaceDir)
  })

  test('reset', async () => {
    expect(Array.from(catalog.items)).toEqual([])
    catalog.reset([itemTable.A, itemTable.B])
    expect(Array.from(catalog.items)).toEqual([itemTable.A, itemTable.B])
    catalog.reset()
    expect(Array.from(catalog.items)).toEqual([])
  })

  test('applyDiff', async () => {
    expect(Array.from(catalog.items)).toEqual([])

    catalog.applyDiff(diffItemsTable.step1)
    expect(Array.from(catalog.items)).toEqual([itemTable.A, itemTable.B])

    catalog.applyDiff(diffItemsTable.step2)
    expect(Array.from(catalog.items)).toEqual([itemTable.B, itemTable.C])

    catalog.applyDiff(diffItemsTable.step3)
    expect(Array.from(catalog.items)).toEqual([itemTable.C, itemTable.A])

    catalog.applyDiff(diffItemsTable.step4)
    expect(Array.from(catalog.items)).toEqual([itemTable.D, itemTable.A2])

    catalog.applyDiff(diffItemsTable.step5)
    expect(Array.from(catalog.items)).toEqual([])
  })

  test('calcCatalogItem', async () => {
    expect(Array.from(catalog.items)).toEqual([])

    await writeFile(filepathA, contentA, encoding)
    const itemA = await catalog.calcCatalogItem(filepathA)

    await writeFile(filepathA, contentA2, encoding)
    const itemA2 = await catalog.calcCatalogItem(filepathA)

    await writeFile(filepathB, contentB, encoding)
    const itemB = await catalog.calcCatalogItem(filepathB)

    await writeFile(filepathC, contentC, encoding)
    const itemC = await catalog.calcCatalogItem(filepathC)

    await writeFile(filepathD, contentD, encoding)
    const itemD = await catalog.calcCatalogItem(filepathD)

    expect(itemA).toEqual(itemDraftTable.A)
    expect(itemA2).toEqual(itemDraftTable.A2)
    expect(itemB).toEqual(itemDraftTable.B)
    expect(itemC).toEqual(itemDraftTable.C)
    expect(itemD).toEqual(itemDraftTable.D)
    expect(Array.from(catalog.items)).toEqual([])
  })

  test('calcCryptFilepath', async () => {
    expect(catalog.calcCryptFilepath(filepathA)).toEqual(itemDraftTable.A.cryptFilepath)
    expect(catalog.calcCryptFilepath(filepathB)).toEqual(itemDraftTable.B.cryptFilepath)
    expect(catalog.calcCryptFilepath(filepathC)).toEqual(itemDraftTable.C.cryptFilepath)
    expect(catalog.calcCryptFilepath(filepathD)).toEqual(itemDraftTable.D.cryptFilepath)
  })

  describe('checkIntegrity', () => {
    test('small files', async () => {
      let plainFilepaths: string[] = []
      let cryptFilepaths: string[] = []
      expect(Array.from(catalog.items)).toEqual([])
      await assertPromiseNotThrow(() =>
        Promise.all([
          catalog.checkPlainIntegrity(plainFilepaths),
          catalog.checkCryptIntegrity(cryptFilepaths),
        ]),
      )

      catalog.reset([itemTable.A, itemTable.B])
      plainFilepaths = [itemTable.A.plainFilepath, itemTable.B.plainFilepath]
      cryptFilepaths = [itemTable.A.cryptFilepath, itemTable.B.cryptFilepath]

      await assertPromiseThrow(
        () =>
          Promise.all([
            catalog.checkPlainIntegrity(plainFilepaths),
            catalog.checkCryptIntegrity(cryptFilepaths),
          ]),
        'Missing plain file.',
      )

      // Plain files exist but the crypt files not exist.
      await writeFile(filepathA, contentA, encoding)
      await writeFile(filepathB, contentB, encoding)
      await assertPromiseNotThrow(() => catalog.checkPlainIntegrity(plainFilepaths))
      await assertPromiseThrow(
        () =>
          Promise.all([
            catalog.checkPlainIntegrity(plainFilepaths),
            catalog.checkCryptIntegrity(cryptFilepaths),
          ]),
        'Missing crypt file.',
      )
      await assertPromiseThrow(
        () => catalog.checkCryptIntegrity(cryptFilepaths),
        'Missing crypt file.',
      )

      // Both plain files and crypt files are exist.
      await writeFile(cryptPathResolver.resolve(itemTable.A.cryptFilepath), contentA, encoding)
      await writeFile(cryptPathResolver.resolve(itemTable.B.cryptFilepath), contentB, encoding)
      await assertPromiseNotThrow(() =>
        Promise.all([
          catalog.checkPlainIntegrity(plainFilepaths),
          catalog.checkCryptIntegrity(cryptFilepaths),
        ]),
      )

      // Crypt files exist but the plain files not exist.
      await rm(filepathA)
      await rm(filepathB)
      await assertPromiseNotThrow(() => catalog.checkCryptIntegrity(cryptFilepaths))
      await assertPromiseThrow(
        () =>
          Promise.all([
            catalog.checkPlainIntegrity(plainFilepaths),
            catalog.checkCryptIntegrity(cryptFilepaths),
          ]),
        'Missing plain file.',
      )
      await assertPromiseThrow(
        () => catalog.checkPlainIntegrity(plainFilepaths),
        'Missing plain file.',
      )
    })

    test('big files', async () => {
      let plainFilepaths: string[] = []
      let cryptFilepaths: string[] = []
      expect(Array.from(catalog.items)).toEqual([])
      await assertPromiseNotThrow(() =>
        Promise.all([
          catalog.checkPlainIntegrity(plainFilepaths),
          catalog.checkCryptIntegrity(cryptFilepaths),
        ]),
      )

      catalog.reset([itemTable.C, itemTable.D])
      plainFilepaths = [itemTable.C.plainFilepath, itemTable.D.plainFilepath]
      cryptFilepaths = [
        ...itemTable.C.cryptFilepathParts.map(part => itemTable.C.cryptFilepath + part),
        ...itemTable.D.cryptFilepathParts.map(part => itemTable.D.cryptFilepath + part),
      ]

      await assertPromiseThrow(
        () =>
          Promise.all([
            catalog.checkPlainIntegrity(plainFilepaths),
            catalog.checkCryptIntegrity(cryptFilepaths),
          ]),
        'Missing plain file.',
      )

      // Plain files exist but the crypt files not exist.
      await writeFile(filepathC, contentC, encoding)
      await writeFile(filepathD, contentD, encoding)
      await assertPromiseNotThrow(() => catalog.checkPlainIntegrity(plainFilepaths))
      await assertPromiseThrow(
        () =>
          Promise.all([
            catalog.checkPlainIntegrity(plainFilepaths),
            catalog.checkCryptIntegrity(cryptFilepaths),
          ]),
        'Missing crypt file part.',
      )
      await assertPromiseThrow(
        () => catalog.checkCryptIntegrity(cryptFilepaths),
        'Missing crypt file part.',
      )

      // Both plain files and crypt files are exist.
      for (const part of itemTable.C.cryptFilepathParts) {
        const absoluteEncryptedFilepath = cryptPathResolver.resolve(
          itemTable.C.cryptFilepath + part,
        )
        await writeFile(absoluteEncryptedFilepath, contentC, encoding)
      }
      for (const part of itemTable.D.cryptFilepathParts) {
        const absoluteEncryptedFilepath = cryptPathResolver.resolve(
          itemTable.D.cryptFilepath + part,
        )
        await writeFile(absoluteEncryptedFilepath, contentD, encoding)
      }
      await assertPromiseNotThrow(() =>
        Promise.all([
          catalog.checkPlainIntegrity(plainFilepaths),
          catalog.checkCryptIntegrity(cryptFilepaths),
        ]),
      )

      // Crypt files exist but the plain files not exist.
      await rm(filepathC)
      await rm(filepathD)
      await assertPromiseNotThrow(() => catalog.checkCryptIntegrity(cryptFilepaths))
      await assertPromiseThrow(
        () =>
          Promise.all([
            catalog.checkPlainIntegrity(plainFilepaths),
            catalog.checkCryptIntegrity(cryptFilepaths),
          ]),
        'Missing plain file.',
      )
      await assertPromiseThrow(
        () => catalog.checkPlainIntegrity(plainFilepaths),
        'Missing plain file.',
      )
    })
  })

  test('diffFromCatalogItems', async () => {
    expect(Array.from(catalog.items)).toEqual([])
    expect(catalog.diffFromCatalogItems([itemTable.A, itemTable.B])).toEqual(diffItemsTable.step1)

    // diffItems1
    {
      const diffItems: ICatalogDiffItem[] = catalog.diffFromCatalogItems([itemTable.A, itemTable.B])
      expect(diffItems).toEqual(diffItemsTable.step1)
      expect(Array.from(catalog.items)).toEqual([])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.A, itemTable.B])
    }

    // diffItems2
    {
      const diffItems: ICatalogDiffItem[] = catalog.diffFromCatalogItems([itemTable.B, itemTable.C])

      expect(diffItems).toEqual(diffItemsTable.step2)
      expect(Array.from(catalog.items)).toEqual([itemTable.A, itemTable.B])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.B, itemTable.C])
    }

    // diffItems3
    {
      const diffItems: ICatalogDiffItem[] = catalog.diffFromCatalogItems([itemTable.A, itemTable.C])

      expect(diffItems).toEqual(diffItemsTable.step3)
      expect(Array.from(catalog.items)).toEqual([itemTable.B, itemTable.C])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.C, itemTable.A])
    }

    // diffItems4
    {
      const diffItems: ICatalogDiffItem[] = catalog.diffFromCatalogItems([
        itemTable.A2,
        itemTable.D,
      ])

      expect(diffItems).toEqual(diffItemsTable.step4)
      expect(Array.from(catalog.items)).toEqual([itemTable.C, itemTable.A])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.D, itemTable.A2])
    }

    // diffItems5
    {
      const diffItems: ICatalogDiffItem[] = catalog.diffFromCatalogItems([])

      expect(diffItems).toEqual(diffItemsTable.step5)
      expect(Array.from(catalog.items)).toEqual([itemTable.D, itemTable.A2])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([])
    }
  })

  test('diffFromPlainFiles', async () => {
    const fileSplitter = new FileSplitter({ partCodePrefix })
    const cipherFactory = new AesGcmCipherFactoryBuilder().buildFromPassword(
      Buffer.from('guanghechen', encoding),
      {
        salt: 'salt',
        iterations: 100000,
        digest: 'sha256',
      },
    )
    const fileCipherFactory = new FileCipherFactory({ cipherFactory, reporter })
    const cipherBatcher = new FileCipherBatcher({
      fileSplitter,
      fileCipherFactory,
      maxTargetFileSize,
      reporter,
    })

    expect(Array.from(catalog.items)).toEqual([])

    // diffITems1
    {
      await writeFile(filepathA, contentA, encoding)
      await writeFile(filepathB, contentB, encoding)
      const draftDiffItems: IDraftCatalogDiffItem[] = await catalog.diffFromPlainFiles(
        [filepathA, filepathB],
        true,
      )
      const diffItems: ICatalogDiffItem[] = await cipherBatcher.batchEncrypt({
        catalog,
        diffItems: draftDiffItems,
        strictCheck: false,
      })

      expect(diffItems).toEqual(diffItemsTable.step1)
      expect(Array.from(catalog.items)).toEqual([])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.A, itemTable.B])
    }

    // corner case
    {
      await assertPromiseThrow(
        () => catalog.diffFromPlainFiles([filepathD], true),
        `is removed but it's not in the catalog before`,
      )

      expect(await catalog.diffFromPlainFiles([filepathD], false)).toEqual([])
    }

    // diffItems2
    {
      await rm(filepathA)
      await writeFile(filepathC, contentC, encoding)
      const draftDiffItems: IDraftCatalogDiffItem[] = await catalog.diffFromPlainFiles(
        [filepathA, filepathB, filepathC],
        true,
      )
      const diffItems: ICatalogDiffItem[] = await cipherBatcher.batchEncrypt({
        catalog,
        diffItems: draftDiffItems,
        strictCheck: false,
      })

      expect(diffItems).toEqual(diffItemsTable.step2)
      expect(Array.from(catalog.items)).toEqual([itemTable.A, itemTable.B])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.B, itemTable.C])
    }

    // diffItems3
    {
      await rm(filepathB)
      await writeFile(filepathA, contentA, encoding)
      const draftDiffItems: IDraftCatalogDiffItem[] = await catalog.diffFromPlainFiles(
        [filepathA, filepathB, filepathC],
        true,
      )
      const diffItems: ICatalogDiffItem[] = await cipherBatcher.batchEncrypt({
        catalog,
        diffItems: draftDiffItems,
        strictCheck: false,
      })

      expect(diffItems).toEqual(diffItemsTable.step3)
      expect(Array.from(catalog.items)).toEqual([itemTable.B, itemTable.C])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.C, itemTable.A])
    }

    // diffItems4
    {
      await rm(filepathC)
      await writeFile(filepathD, contentD, encoding)
      await writeFile(filepathA, contentA2, encoding)
      const draftDiffItems: IDraftCatalogDiffItem[] = await catalog.diffFromPlainFiles(
        [filepathA, filepathC, filepathD],
        true,
      )
      const diffItems: ICatalogDiffItem[] = await cipherBatcher.batchEncrypt({
        catalog,
        diffItems: draftDiffItems,
        strictCheck: false,
      })

      expect(diffItems).toEqual(diffItemsTable.step4)
      expect(Array.from(catalog.items)).toEqual([itemTable.C, itemTable.A])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.D, itemTable.A2])
    }

    // diffItems5
    {
      await rm(filepathA)
      await rm(filepathD)
      const draftDiffItems: IDraftCatalogDiffItem[] = await catalog.diffFromPlainFiles(
        [filepathD, filepathA],
        true,
      )
      const diffItems: ICatalogDiffItem[] = await cipherBatcher.batchEncrypt({
        catalog,
        diffItems: draftDiffItems,
        strictCheck: false,
      })

      expect(diffItems).toEqual(diffItemsTable.step5)
      expect(Array.from(catalog.items)).toEqual([itemTable.D, itemTable.A2])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([])
    }
  })
})
