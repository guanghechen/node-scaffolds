import ChalkLogger from '@guanghechen/chalk-logger'
import { emptyDir, rm, writeFile } from '@guanghechen/helper-fs'
import { falsy, truthy } from '@guanghechen/helper-func'
import { assertPromiseNotThrow, assertPromiseThrow, locateFixtures } from 'jest.helper'
import path from 'node:path'
import { FileCipherCatalog, FileCipherPathResolver } from '../src'
import type { IFileCipherCatalogItemDiff } from '../src'
import {
  contentTable,
  diffItemsTable,
  encoding,
  encryptedDir,
  itemTable,
  maxTargetFileSize,
  partCodePrefix,
} from './_data'

describe('FileCipherCatalog', () => {
  const workspaceDir: string = locateFixtures('__fictitious__.FileCipherCatalog')
  const plainRootDir: string = path.join(workspaceDir, 'src')
  const cryptRootDir: string = path.join(workspaceDir, 'src_encrypted')
  const pathResolver = new FileCipherPathResolver({
    plainRootDir: plainRootDir,
    cryptRootDir: cryptRootDir,
  })
  const logger = new ChalkLogger({ name: 'FileCipherCatalog' })

  const filepathA: string = pathResolver.calcAbsolutePlainFilepath(itemTable.A.plainFilepath)
  const filepathB: string = pathResolver.calcAbsolutePlainFilepath(itemTable.B.plainFilepath)
  const filepathC: string = pathResolver.calcAbsolutePlainFilepath(itemTable.C.plainFilepath)
  const filepathD: string = pathResolver.calcAbsolutePlainFilepath(itemTable.D.plainFilepath)

  const contentA: string = contentTable.A
  const contentA2: string = contentTable.A2
  const contentB: string = contentTable.B
  const contentC: string = contentTable.C
  const contentD: string = contentTable.D

  const catalog = new FileCipherCatalog({
    pathResolver,
    cryptDir: encryptedDir,
    maxTargetFileSize,
    partCodePrefix,
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

    expect(itemA).toEqual(itemTable.A)
    expect(itemA2).toEqual(itemTable.A2)
    expect(itemB).toEqual(itemTable.B)
    expect(itemC).toEqual(itemTable.C)
    expect(itemD).toEqual(itemTable.D)
    expect(Array.from(catalog.items)).toEqual([])
  })

  describe('checkIntegrity', () => {
    test('small files', async () => {
      expect(Array.from(catalog.items)).toEqual([])
      await assertPromiseNotThrow(() =>
        catalog.checkIntegrity({ flags: { plainFiles: true, cryptFiles: true } }),
      )

      catalog.reset([itemTable.A, itemTable.B])
      await assertPromiseThrow(
        () => catalog.checkIntegrity({ flags: { plainFiles: true, cryptFiles: true } }),
        'Missing plain file.',
      )
      await assertPromiseNotThrow(() => catalog.checkIntegrity({ flags: {} }))

      // Plain files exist but the crypt files not exist.
      await writeFile(filepathA, contentA, encoding)
      await writeFile(filepathB, contentB, encoding)
      await assertPromiseNotThrow(() =>
        catalog.checkIntegrity({ flags: { plainFiles: true, cryptFiles: false } }),
      )
      await assertPromiseThrow(
        () => catalog.checkIntegrity({ flags: { plainFiles: true, cryptFiles: true } }),
        'Missing crypt file.',
      )
      await assertPromiseThrow(
        () => catalog.checkIntegrity({ flags: { cryptFiles: true } }),
        'Missing crypt file.',
      )

      // Both plain files and crypt files are exist.
      await writeFile(
        pathResolver.calcAbsoluteCryptFilepath(itemTable.A.cryptFilepath),
        contentA,
        encoding,
      )
      await writeFile(
        pathResolver.calcAbsoluteCryptFilepath(itemTable.B.cryptFilepath),
        contentB,
        encoding,
      )
      await assertPromiseNotThrow(() =>
        catalog.checkIntegrity({ flags: { plainFiles: true, cryptFiles: true } }),
      )

      // Crypt files exist but the plain files not exist.
      await rm(filepathA)
      await rm(filepathB)
      await assertPromiseNotThrow(() =>
        catalog.checkIntegrity({ flags: { plainFiles: false, cryptFiles: true } }),
      )
      await assertPromiseThrow(
        () => catalog.checkIntegrity({ flags: { plainFiles: true, cryptFiles: true } }),
        'Missing plain file.',
      )
      await assertPromiseThrow(
        () => catalog.checkIntegrity({ flags: { plainFiles: true } }),
        'Missing plain file.',
      )
    })

    test('big files', async () => {
      expect(Array.from(catalog.items)).toEqual([])
      await assertPromiseNotThrow(() =>
        catalog.checkIntegrity({ flags: { plainFiles: true, cryptFiles: true } }),
      )
      await assertPromiseNotThrow(() => catalog.checkIntegrity({ flags: {} }))

      catalog.reset([itemTable.C, itemTable.D])
      await assertPromiseThrow(
        () => catalog.checkIntegrity({ flags: { plainFiles: true, cryptFiles: true } }),
        'Missing plain file.',
      )

      // Plain files exist but the crypt files not exist.
      await writeFile(filepathC, contentC, encoding)
      await writeFile(filepathD, contentD, encoding)
      await assertPromiseNotThrow(() =>
        catalog.checkIntegrity({ flags: { plainFiles: true, cryptFiles: false } }),
      )
      await assertPromiseThrow(
        () => catalog.checkIntegrity({ flags: { plainFiles: true, cryptFiles: true } }),
        'Missing crypt file part.',
      )
      await assertPromiseThrow(
        () => catalog.checkIntegrity({ flags: { cryptFiles: true } }),
        'Missing crypt file part.',
      )

      // Both plain files and crypt files are exist.
      for (const part of itemTable.C.cryptFileParts) {
        const absoluteEncryptedFilepath = pathResolver.calcAbsoluteCryptFilepath(
          itemTable.C.cryptFilepath + part,
        )
        await writeFile(absoluteEncryptedFilepath, contentC, encoding)
      }
      for (const part of itemTable.D.cryptFileParts) {
        const absoluteEncryptedFilepath = pathResolver.calcAbsoluteCryptFilepath(
          itemTable.D.cryptFilepath + part,
        )
        await writeFile(absoluteEncryptedFilepath, contentD, encoding)
      }
      await assertPromiseNotThrow(() =>
        catalog.checkIntegrity({ flags: { plainFiles: true, cryptFiles: true } }),
      )

      // Crypt files exist but the plain files not exist.
      await rm(filepathC)
      await rm(filepathD)
      await assertPromiseNotThrow(() =>
        catalog.checkIntegrity({ flags: { plainFiles: false, cryptFiles: true } }),
      )
      await assertPromiseThrow(
        () => catalog.checkIntegrity({ flags: { plainFiles: true, cryptFiles: true } }),
        'Missing plain file.',
      )
      await assertPromiseThrow(
        () => catalog.checkIntegrity({ flags: { plainFiles: true } }),
        'Missing plain file.',
      )
    })
  })

  test('diffFromCatalogItems', async () => {
    expect(Array.from(catalog.items)).toEqual([])

    // diffItems1
    {
      const diffItems: IFileCipherCatalogItemDiff[] = catalog.diffFromCatalogItems({
        newItems: [itemTable.A, itemTable.B],
      })
      expect(diffItems).toEqual(diffItemsTable.step1)
      expect(Array.from(catalog.items)).toEqual([])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.A, itemTable.B])
    }

    // diffItems2
    {
      const diffItems: IFileCipherCatalogItemDiff[] = catalog.diffFromCatalogItems({
        newItems: [itemTable.B, itemTable.C],
      })

      expect(diffItems).toEqual(diffItemsTable.step2)
      expect(Array.from(catalog.items)).toEqual([itemTable.A, itemTable.B])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.B, itemTable.C])
    }

    // diffItems3
    {
      const diffItems: IFileCipherCatalogItemDiff[] = catalog.diffFromCatalogItems({
        newItems: [itemTable.A, itemTable.C],
      })

      expect(diffItems).toEqual(diffItemsTable.step3)
      expect(Array.from(catalog.items)).toEqual([itemTable.B, itemTable.C])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.C, itemTable.A])
    }

    // diffItems4
    {
      const diffItems: IFileCipherCatalogItemDiff[] = catalog.diffFromCatalogItems({
        newItems: [itemTable.A2, itemTable.D],
      })

      expect(diffItems).toEqual(diffItemsTable.step4)
      expect(Array.from(catalog.items)).toEqual([itemTable.C, itemTable.A])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.D, itemTable.A2])
    }

    // diffItems5
    {
      const diffItems: IFileCipherCatalogItemDiff[] = catalog.diffFromCatalogItems({
        newItems: [],
      })

      expect(diffItems).toEqual(diffItemsTable.step5)
      expect(Array.from(catalog.items)).toEqual([itemTable.D, itemTable.A2])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([])
    }
  })

  test('diffFromPlainFiles', async () => {
    expect(Array.from(catalog.items)).toEqual([])

    // diffITems1
    {
      await writeFile(filepathA, contentA, encoding)
      await writeFile(filepathB, contentB, encoding)
      const diffItems: IFileCipherCatalogItemDiff[] = await catalog.diffFromPlainFiles({
        plainFilepaths: [filepathA, filepathB],
      })

      expect(diffItems).toEqual(diffItemsTable.step1)
      expect(Array.from(catalog.items)).toEqual([])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([itemTable.A, itemTable.B])
    }

    // diffItems2
    {
      await rm(filepathA)
      await writeFile(filepathC, contentC, encoding)
      const diffItems: IFileCipherCatalogItemDiff[] = await catalog.diffFromPlainFiles({
        plainFilepaths: [filepathA, filepathB, filepathC],
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
      const diffItems: IFileCipherCatalogItemDiff[] = await catalog.diffFromPlainFiles({
        plainFilepaths: [filepathA, filepathB, filepathC],
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
      const diffItems: IFileCipherCatalogItemDiff[] = await catalog.diffFromPlainFiles({
        plainFilepaths: [filepathA, filepathC, filepathD],
        isKeepPlain: sourceFilepath => sourceFilepath === 'd.txt',
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
      const diffItems: IFileCipherCatalogItemDiff[] = await catalog.diffFromPlainFiles({
        plainFilepaths: [filepathD, filepathA],
      })

      expect(diffItems).toEqual(diffItemsTable.step5)
      expect(Array.from(catalog.items)).toEqual([itemTable.D, itemTable.A2])
      catalog.applyDiff(diffItems)
      expect(Array.from(catalog.items)).toEqual([])
    }
  })
})
