import { ChalkLogger } from '@guanghechen/chalk-logger'
import { AesGcmCipherFactoryBuilder } from '@guanghechen/cipher'
import { FileSplitter } from '@guanghechen/file-split'
import { iterable2map } from '@guanghechen/helper-func'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import {
  assertPromiseNotThrow,
  assertPromiseThrow,
  emptyDir,
  locateFixtures,
  rm,
  writeFile,
} from 'jest.helper'
import path from 'node:path'
import {
  FileCipherBatcher,
  FileCipherCatalog,
  FileCipherCatalogContext,
  FileCipherFactory,
  diffFromCatalogItems,
  isSameFileCipherItemDraft,
} from '../src'
import type {
  IFileCipherCatalogDiffItem,
  IFileCipherCatalogDiffItemDraft,
  IFileCipherCatalogItemDraft,
} from '../src'
import {
  contentHashAlgorithm,
  contentTable,
  cryptFilesDir,
  diffItemsTable,
  encoding,
  itemDraftTable,
  itemTable,
  maxTargetFileSize,
  partCodePrefix,
  pathHashAlgorithm,
} from './_data'

describe('FileCipherCatalog', () => {
  const workspaceDir: string = locateFixtures('__fictitious__.FileCipherCatalog')
  const plainRootDir: string = path.join(workspaceDir, 'src')
  const cryptRootDir: string = path.join(workspaceDir, 'src_encrypted')
  const plainPathResolver = new WorkspacePathResolver(plainRootDir, pathResolver)
  const cryptPathResolver = new WorkspacePathResolver(cryptRootDir, pathResolver)
  const logger = new ChalkLogger({ name: 'FileCipherCatalog' })

  const filepathA: string = plainPathResolver.resolve(itemTable.A.plainFilepath)
  const filepathB: string = plainPathResolver.resolve(itemTable.B.plainFilepath)
  const filepathC: string = plainPathResolver.resolve(itemTable.C.plainFilepath)
  const filepathD: string = plainPathResolver.resolve(itemTable.D.plainFilepath)

  const contentA: string = contentTable.A
  const contentA2: string = contentTable.A2
  const contentB: string = contentTable.B
  const contentC: string = contentTable.C
  const contentD: string = contentTable.D

  const catalogContext = new FileCipherCatalogContext({
    cryptFilesDir,
    cryptFilepathSalt: 'guanghechen',
    maxTargetFileSize,
    partCodePrefix,
    contentHashAlgorithm: contentHashAlgorithm,
    pathHashAlgorithm: pathHashAlgorithm,
    plainPathResolver,
    cryptPathResolver,
    isKeepPlain: sourceFilepath => sourceFilepath === 'a.txt',
  })
  const catalog = new FileCipherCatalog({
    context: catalogContext,
    cryptPathResolver,
    plainPathResolver,
  })

  beforeEach(async () => {
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
    expect(
      diffFromCatalogItems(
        new Map(),
        iterable2map([itemTable.A, itemTable.B], item => item.plainFilepath),
      ),
    ).toEqual(diffItemsTable.step1)

    // diffItems1
    {
      const diffItems: IFileCipherCatalogDiffItem[] = catalog.diffFromCatalogItems({
        newItems: [itemTable.A, itemTable.B],
      })
      expect(diffItems).toEqual(diffItemsTable.step1)
      expect(Array.from(catalog.items)).toEqual([])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.A, itemTable.B])
    }

    // diffItems2
    {
      const diffItems: IFileCipherCatalogDiffItem[] = catalog.diffFromCatalogItems({
        newItems: [itemTable.B, itemTable.C],
      })

      expect(diffItems).toEqual(diffItemsTable.step2)
      expect(Array.from(catalog.items)).toEqual([itemTable.A, itemTable.B])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.B, itemTable.C])
    }

    // diffItems3
    {
      const diffItems: IFileCipherCatalogDiffItem[] = catalog.diffFromCatalogItems({
        newItems: [itemTable.A, itemTable.C],
      })

      expect(diffItems).toEqual(diffItemsTable.step3)
      expect(Array.from(catalog.items)).toEqual([itemTable.B, itemTable.C])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.C, itemTable.A])
    }

    // diffItems4
    {
      const diffItems: IFileCipherCatalogDiffItem[] = catalog.diffFromCatalogItems({
        newItems: [itemTable.A2, itemTable.D],
      })

      expect(diffItems).toEqual(diffItemsTable.step4)
      expect(Array.from(catalog.items)).toEqual([itemTable.C, itemTable.A])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.D, itemTable.A2])
    }

    // diffItems5
    {
      const diffItems: IFileCipherCatalogDiffItem[] = catalog.diffFromCatalogItems({
        newItems: [],
      })

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
    const fileCipherFactory = new FileCipherFactory({ cipherFactory, logger })
    const cipherBatcher = new FileCipherBatcher({
      fileSplitter,
      fileCipherFactory,
      maxTargetFileSize,
      logger,
    })
    const getIv = async (item: IFileCipherCatalogItemDraft): Promise<Buffer | undefined> =>
      Object.values(itemTable).find(t => isSameFileCipherItemDraft(t, item))?.iv

    expect(Array.from(catalog.items)).toEqual([])

    // diffITems1
    {
      await writeFile(filepathA, contentA, encoding)
      await writeFile(filepathB, contentB, encoding)
      const draftDiffItems: IFileCipherCatalogDiffItemDraft[] = await catalog.diffFromPlainFiles({
        plainFilepaths: [filepathA, filepathB],
        strickCheck: true,
      })
      const diffItems: IFileCipherCatalogDiffItem[] = await cipherBatcher.batchEncrypt({
        strictCheck: false,
        plainPathResolver,
        cryptPathResolver,
        diffItems: draftDiffItems,
        getIv,
      })

      expect(diffItems).toEqual(diffItemsTable.step1)
      expect(Array.from(catalog.items)).toEqual([])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.A, itemTable.B])
    }

    // corner case
    {
      await assertPromiseThrow(
        () =>
          catalog.diffFromPlainFiles({
            plainFilepaths: [filepathD],
            strickCheck: true,
          }),
        `is removed but it's not in the catalog before`,
      )

      expect(
        await catalog.diffFromPlainFiles({
          plainFilepaths: [filepathD],
          strickCheck: false,
        }),
      ).toEqual([])
    }

    // diffItems2
    {
      await rm(filepathA)
      await writeFile(filepathC, contentC, encoding)
      const draftDiffItems: IFileCipherCatalogDiffItemDraft[] = await catalog.diffFromPlainFiles({
        plainFilepaths: [filepathA, filepathB, filepathC],
        strickCheck: true,
      })
      const diffItems: IFileCipherCatalogDiffItem[] = await cipherBatcher.batchEncrypt({
        strictCheck: false,
        plainPathResolver,
        cryptPathResolver,
        diffItems: draftDiffItems,
        getIv,
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
      const draftDiffItems: IFileCipherCatalogDiffItemDraft[] = await catalog.diffFromPlainFiles({
        plainFilepaths: [filepathA, filepathB, filepathC],
        strickCheck: true,
      })
      const diffItems: IFileCipherCatalogDiffItem[] = await cipherBatcher.batchEncrypt({
        strictCheck: false,
        plainPathResolver,
        cryptPathResolver,
        diffItems: draftDiffItems,
        getIv,
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
      const draftDiffItems: IFileCipherCatalogDiffItemDraft[] = await catalog.diffFromPlainFiles({
        plainFilepaths: [filepathA, filepathC, filepathD],
        strickCheck: true,
      })
      const diffItems: IFileCipherCatalogDiffItem[] = await cipherBatcher.batchEncrypt({
        strictCheck: false,
        plainPathResolver,
        cryptPathResolver,
        diffItems: draftDiffItems,
        getIv,
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
      const draftDiffItems: IFileCipherCatalogDiffItemDraft[] = await catalog.diffFromPlainFiles({
        plainFilepaths: [filepathD, filepathA],
        strickCheck: true,
      })
      const diffItems: IFileCipherCatalogDiffItem[] = await cipherBatcher.batchEncrypt({
        strictCheck: false,
        plainPathResolver,
        cryptPathResolver,
        diffItems: draftDiffItems,
        getIv,
      })

      expect(diffItems).toEqual(diffItemsTable.step5)
      expect(Array.from(catalog.items)).toEqual([itemTable.D, itemTable.A2])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([])
    }
  })
})
