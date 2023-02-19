import { ChalkLogger } from '@guanghechen/chalk-logger'
import { AesGcmCipherFactory } from '@guanghechen/helper-cipher'
import { BigFileHelper } from '@guanghechen/helper-file'
import { falsy, truthy } from '@guanghechen/helper-func'
import { FilepathResolver } from '@guanghechen/helper-path'
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
  FileCipherFactory,
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
  const plainPathResolver = new FilepathResolver(plainRootDir)
  const cryptPathResolver = new FilepathResolver(cryptRootDir)
  const logger = new ChalkLogger({ name: 'FileCipherCatalog' })

  const filepathA: string = plainPathResolver.absolute(itemTable.A.plainFilepath)
  const filepathB: string = plainPathResolver.absolute(itemTable.B.plainFilepath)
  const filepathC: string = plainPathResolver.absolute(itemTable.C.plainFilepath)
  const filepathD: string = plainPathResolver.absolute(itemTable.D.plainFilepath)

  const contentA: string = contentTable.A
  const contentA2: string = contentTable.A2
  const contentB: string = contentTable.B
  const contentC: string = contentTable.C
  const contentD: string = contentTable.D

  const catalog = new FileCipherCatalog({
    plainPathResolver,
    cryptFilesDir,
    cryptFilepathSalt: 'guanghechen',
    maxTargetFileSize,
    partCodePrefix,
    contentHashAlgorithm: contentHashAlgorithm,
    pathHashAlgorithm: pathHashAlgorithm,
    logger,
    isKeepPlain: sourceFilepath => sourceFilepath === 'a.txt',
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
    const itemA = await catalog.calcCatalogItem({ plainFilepath: filepathA })

    await writeFile(filepathA, contentA2, encoding)
    const itemA2 = await catalog.calcCatalogItem({
      plainFilepath: filepathA,
      isKeepPlain: falsy,
    })

    await writeFile(filepathB, contentB, encoding)
    const itemB = await catalog.calcCatalogItem({ plainFilepath: filepathB })

    await writeFile(filepathC, contentC, encoding)
    const itemC = await catalog.calcCatalogItem({ plainFilepath: filepathC })

    await writeFile(filepathD, contentD, encoding)
    const itemD = await catalog.calcCatalogItem({
      plainFilepath: filepathD,
      isKeepPlain: truthy,
    })

    expect(itemA).toEqual(itemDraftTable.A)
    expect(itemA2).toEqual(itemDraftTable.A2)
    expect(itemB).toEqual(itemDraftTable.B)
    expect(itemC).toEqual(itemDraftTable.C)
    expect(itemD).toEqual(itemDraftTable.D)
    expect(Array.from(catalog.items)).toEqual([])
  })

  describe('checkIntegrity', () => {
    test('small files', async () => {
      expect(Array.from(catalog.items)).toEqual([])
      await assertPromiseNotThrow(() =>
        Promise.all([
          catalog.checkPlainIntegrity(),
          catalog.checkCryptIntegrity({ cryptPathResolver }),
        ]),
      )

      catalog.reset([itemTable.A, itemTable.B])
      await assertPromiseThrow(
        () =>
          Promise.all([
            catalog.checkPlainIntegrity(),
            catalog.checkCryptIntegrity({ cryptPathResolver }),
          ]),
        'Missing plain file.',
      )

      // Plain files exist but the crypt files not exist.
      await writeFile(filepathA, contentA, encoding)
      await writeFile(filepathB, contentB, encoding)
      await assertPromiseNotThrow(() => catalog.checkPlainIntegrity())
      await assertPromiseThrow(
        () =>
          Promise.all([
            catalog.checkPlainIntegrity(),
            catalog.checkCryptIntegrity({ cryptPathResolver }),
          ]),
        'Missing crypt file.',
      )
      await assertPromiseThrow(
        () => catalog.checkCryptIntegrity({ cryptPathResolver }),
        'Missing crypt file.',
      )

      // Both plain files and crypt files are exist.
      await writeFile(cryptPathResolver.absolute(itemTable.A.cryptFilepath), contentA, encoding)
      await writeFile(cryptPathResolver.absolute(itemTable.B.cryptFilepath), contentB, encoding)
      await assertPromiseNotThrow(() =>
        Promise.all([
          catalog.checkPlainIntegrity(),
          catalog.checkCryptIntegrity({ cryptPathResolver }),
        ]),
      )

      // Crypt files exist but the plain files not exist.
      await rm(filepathA)
      await rm(filepathB)
      await assertPromiseNotThrow(() => catalog.checkCryptIntegrity({ cryptPathResolver }))
      await assertPromiseThrow(
        () =>
          Promise.all([
            catalog.checkPlainIntegrity(),
            catalog.checkCryptIntegrity({ cryptPathResolver }),
          ]),
        'Missing plain file.',
      )
      await assertPromiseThrow(() => catalog.checkPlainIntegrity(), 'Missing plain file.')
    })

    test('big files', async () => {
      expect(Array.from(catalog.items)).toEqual([])
      await assertPromiseNotThrow(() =>
        Promise.all([
          catalog.checkPlainIntegrity(),
          catalog.checkCryptIntegrity({ cryptPathResolver }),
        ]),
      )

      catalog.reset([itemTable.C, itemTable.D])
      await assertPromiseThrow(
        () =>
          Promise.all([
            catalog.checkPlainIntegrity(),
            catalog.checkCryptIntegrity({ cryptPathResolver }),
          ]),
        'Missing plain file.',
      )

      // Plain files exist but the crypt files not exist.
      await writeFile(filepathC, contentC, encoding)
      await writeFile(filepathD, contentD, encoding)
      await assertPromiseNotThrow(() => catalog.checkPlainIntegrity())
      await assertPromiseThrow(
        () =>
          Promise.all([
            catalog.checkPlainIntegrity(),
            catalog.checkCryptIntegrity({ cryptPathResolver }),
          ]),
        'Missing crypt file part.',
      )
      await assertPromiseThrow(
        () => catalog.checkCryptIntegrity({ cryptPathResolver }),
        'Missing crypt file part.',
      )

      // Both plain files and crypt files are exist.
      for (const part of itemTable.C.cryptFileParts) {
        const absoluteEncryptedFilepath = cryptPathResolver.absolute(
          itemTable.C.cryptFilepath + part,
        )
        await writeFile(absoluteEncryptedFilepath, contentC, encoding)
      }
      for (const part of itemTable.D.cryptFileParts) {
        const absoluteEncryptedFilepath = cryptPathResolver.absolute(
          itemTable.D.cryptFilepath + part,
        )
        await writeFile(absoluteEncryptedFilepath, contentD, encoding)
      }
      await assertPromiseNotThrow(() =>
        Promise.all([
          catalog.checkPlainIntegrity(),
          catalog.checkCryptIntegrity({ cryptPathResolver }),
        ]),
      )

      // Crypt files exist but the plain files not exist.
      await rm(filepathC)
      await rm(filepathD)
      await assertPromiseNotThrow(() => catalog.checkCryptIntegrity({ cryptPathResolver }))
      await assertPromiseThrow(
        () =>
          Promise.all([
            catalog.checkPlainIntegrity(),
            catalog.checkCryptIntegrity({ cryptPathResolver }),
          ]),
        'Missing plain file.',
      )
      await assertPromiseThrow(() => catalog.checkPlainIntegrity(), 'Missing plain file.')
    })
  })

  test('diffFromCatalogItems', async () => {
    expect(Array.from(catalog.items)).toEqual([])

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
    const fileHelper = new BigFileHelper({ partCodePrefix })
    const cipherFactory = new AesGcmCipherFactory()
    cipherFactory.initFromPassword(Buffer.from('guanghechen', encoding), {
      salt: 'salt',
      iterations: 100000,
      digest: 'sha256',
    })
    const fileCipherFactory = new FileCipherFactory({ cipherFactory, logger })
    const cipherBatcher = new FileCipherBatcher({
      fileHelper,
      fileCipherFactory,
      maxTargetFileSize,
      logger,
    })
    const getIv = async (item: IFileCipherCatalogItemDraft): Promise<Buffer | undefined> => {
      const draftIv: string | undefined = Object.values(itemTable).find(t =>
        isSameFileCipherItemDraft(t, item),
      )?.iv
      return draftIv ? Buffer.from(draftIv, 'hex') : undefined
    }

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
        isKeepPlain: sourceFilepath => sourceFilepath === 'd.txt',
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
