import { text2bytes } from '@guanghechen/byte'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import type {
  ICatalogDiffItem,
  ICipherCatalog,
  ICipherCatalogContext,
  ICipherCatalogStat,
} from '@guanghechen/cipher-catalog.types'
import { isFileSync } from '@guanghechen/internal'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import { Reporter } from '@guanghechen/reporter'
import { emptyDir, locateFixtures, rm, writeFile } from 'jest.helper'
import { stat as statFile } from 'node:fs/promises'
import path from 'node:path'
import { CipherCatalog, calcFingerprintFromFile } from '../src'
import {
  CONTENT_HASH_ALGORITHM,
  CRYPT_FILES_DIR,
  CRYPT_PATH_SALT,
  MAX_CRYPT_FILE_SIZE,
  NONCE_SIZE,
  PART_CODE_PREFIX,
  PATH_HASH_ALGORITHM,
  contentTable,
  diffItemsTable,
  encoding,
  itemDraftTable,
  itemTable,
} from './_data'

describe('CipherCatalog', () => {
  const workspaceDir: string = locateFixtures('__fictitious__.FileCipherCatalog')
  const plainRootDir: string = path.join(workspaceDir, 'src')
  const cryptRootDir: string = path.join(workspaceDir, 'src_encrypted')
  const plainPathResolver = new WorkspacePathResolver(plainRootDir, pathResolver)
  const cryptPathResolver = new WorkspacePathResolver(cryptRootDir, pathResolver)
  const reporter = new Reporter(chalk, { baseName: 'FileCipherCatalog' })

  const plainPathA: string = itemTable.A.plainPath
  const plainPathB: string = itemTable.B.plainPath
  const plainPathC: string = itemTable.C.plainPath
  const plainPathD: string = itemTable.D.plainPath
  const absolutePlainPathA: string = plainPathResolver.resolve(plainPathA)
  const absolutePlainPathB: string = plainPathResolver.resolve(plainPathB)
  const absolutePlainPathC: string = plainPathResolver.resolve(plainPathC)
  const absolutePlainPathD: string = plainPathResolver.resolve(plainPathD)

  const contentA: string = contentTable.A
  const contentA2: string = contentTable.A2
  const contentB: string = contentTable.B
  const contentC: string = contentTable.C
  const contentD: string = contentTable.D

  let catalog: ICipherCatalog

  beforeAll(() => {
    const catalogContext: ICipherCatalogContext = {
      CONTENT_HASH_ALGORITHM,
      CRYPT_FILES_DIR,
      CRYPT_PATH_SALT,
      MAX_CRYPT_FILE_SIZE,
      NONCE_SIZE,
      PART_CODE_PREFIX,
      PATH_HASH_ALGORITHM,
      genNonce: async () => text2bytes('af5e87dbe9a86c24d35df07e5151bb76', 'hex'),
      hashPlainFile: async (plainPath: string): Promise<string> => {
        const absolutePlainPath: string = plainPathResolver.resolve(plainPath)
        return calcFingerprintFromFile(absolutePlainPath, CONTENT_HASH_ALGORITHM)
      },
      isCryptPathExist: async (cryptPath: string): Promise<boolean> => {
        const absoluteCryptPath: string = cryptPathResolver.resolve(cryptPath)
        return isFileSync(absoluteCryptPath)
      },
      isKeepPlain: async sourceFilepath => sourceFilepath === 'a.txt',
      isKeepIntegrity: async () => false,
      isPlainPathExist: async (plainPath: string): Promise<boolean> => {
        const absolutePlainPath: string = plainPathResolver.resolve(plainPath)
        return isFileSync(absolutePlainPath)
      },
      normalizeCryptPath: (cryptPath: string): string | never => {
        return cryptPathResolver.relative(cryptPath, true)
      },
      normalizePlainPath: (cryptPath: string): string | never => {
        return plainPathResolver.relative(cryptPath, true)
      },
      statCryptFile: async (cryptPath: string): Promise<ICipherCatalogStat | undefined> => {
        const absoluteCryptPath: string = cryptPathResolver.resolve(cryptPath)
        if (!isFileSync(absoluteCryptPath)) return undefined
        const stat = await statFile(absoluteCryptPath)
        return {
          ctime: 0,
          mtime: 0,
          size: stat.size,
        }
      },
      statPlainFile: async (plainPath: string): Promise<ICipherCatalogStat | undefined> => {
        const absolutePlainPath: string = plainPathResolver.resolve(plainPath)
        if (!isFileSync(absolutePlainPath)) return undefined
        const stat = await statFile(absolutePlainPath)
        return {
          ctime: 0,
          mtime: 0,
          size: stat.size,
        }
      },
    }
    catalog = new CipherCatalog(catalogContext)
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

    await writeFile(absolutePlainPathA, contentA, encoding)
    const itemA = await catalog.calcCatalogItem(plainPathA)

    await writeFile(absolutePlainPathA, contentA2, encoding)
    const itemA2 = await catalog.calcCatalogItem(plainPathA)

    await writeFile(absolutePlainPathB, contentB, encoding)
    const itemB = await catalog.calcCatalogItem(plainPathB)

    await writeFile(absolutePlainPathC, contentC, encoding)
    const itemC = await catalog.calcCatalogItem(plainPathC)

    await writeFile(absolutePlainPathD, contentD, encoding)
    const itemD = await catalog.calcCatalogItem(plainPathD)

    expect(itemA).toEqual(itemDraftTable.A)
    expect(itemA2).toEqual(itemDraftTable.A2)
    expect(itemB).toEqual(itemDraftTable.B)
    expect(itemC).toEqual(itemDraftTable.C)
    expect(itemD).toEqual(itemDraftTable.D)
    expect(Array.from(catalog.items)).toEqual([])
  })

  test('calcCryptPath', async () => {
    expect(await catalog.calcCryptPath(plainPathA)).toEqual(itemDraftTable.A.cryptPath)
    expect(await catalog.calcCryptPath(plainPathB)).toEqual(itemDraftTable.B.cryptPath)
    expect(await catalog.calcCryptPath(plainPathC)).toEqual(itemDraftTable.C.cryptPath)
    expect(await catalog.calcCryptPath(plainPathD)).toEqual(itemDraftTable.D.cryptPath)
  })

  describe('checkIntegrity', () => {
    test('small files', async () => {
      let plainPaths: string[] = []
      let cryptPaths: string[] = []
      expect(Array.from(catalog.items)).toEqual([])
      expect([
        ...(await catalog.checkPlainIntegrity(new Set(plainPaths), false)),
        ...(await catalog.checkCryptIntegrity(new Set(cryptPaths), false)),
      ]).toMatchInlineSnapshot(`[]`)

      catalog.reset([itemTable.A, itemTable.B])
      plainPaths = [itemTable.A.plainPath, itemTable.B.plainPath]
      cryptPaths = [itemTable.A.cryptPath, itemTable.B.cryptPath]

      expect([
        ...(await catalog.checkPlainIntegrity(new Set(plainPaths), false)),
        ...(await catalog.checkCryptIntegrity(new Set(cryptPaths), false)),
      ]).toMatchInlineSnapshot(`
        [
          "[ReadonlyCipherCatalog.checkPlainIntegrity] Missing plain file. (a.txt)",
          "[ReadonlyCipherCatalog.checkPlainIntegrity] Missing plain file. (b.txt)",
          "[ReadonlyCipherCatalog.checkCryptIntegrity] Missing crypt file. (a.txt)",
          "[ReadonlyCipherCatalog.checkCryptIntegrity] Missing crypt file. (kirito/346444a4bea4020a29c70628ff065310bdf906bafe1bb389603865bd9acbc74a)",
        ]
      `)

      // Plain files exist but the crypt files not exist.
      await writeFile(absolutePlainPathA, contentA, encoding)
      await writeFile(absolutePlainPathB, contentB, encoding)
      expect([
        ...(await catalog.checkPlainIntegrity(new Set(plainPaths), false)),
        ...(await catalog.checkCryptIntegrity(new Set(cryptPaths), false)),
      ]).toMatchInlineSnapshot(`
        [
          "[ReadonlyCipherCatalog.checkCryptIntegrity] Missing crypt file. (a.txt)",
          "[ReadonlyCipherCatalog.checkCryptIntegrity] Missing crypt file. (kirito/346444a4bea4020a29c70628ff065310bdf906bafe1bb389603865bd9acbc74a)",
        ]
      `)

      // Both plain files and crypt files are exist.
      await writeFile(cryptPathResolver.resolve(itemTable.A.cryptPath), contentA, encoding)
      await writeFile(cryptPathResolver.resolve(itemTable.B.cryptPath), contentB, encoding)
      expect([
        ...(await catalog.checkPlainIntegrity(new Set(plainPaths), false)),
        ...(await catalog.checkCryptIntegrity(new Set(cryptPaths), false)),
      ]).toMatchInlineSnapshot(`[]`)

      // Crypt files exist but the plain files not exist.
      await rm(absolutePlainPathA)
      await rm(absolutePlainPathB)
      expect([
        ...(await catalog.checkPlainIntegrity(new Set(plainPaths), false)),
        ...(await catalog.checkCryptIntegrity(new Set(cryptPaths), false)),
      ]).toMatchInlineSnapshot(`
        [
          "[ReadonlyCipherCatalog.checkPlainIntegrity] Missing plain file. (a.txt)",
          "[ReadonlyCipherCatalog.checkPlainIntegrity] Missing plain file. (b.txt)",
        ]
      `)
    })

    test('big files', async () => {
      let plainPaths: string[] = []
      let cryptPaths: string[] = []
      expect(Array.from(catalog.items)).toEqual([])
      expect([
        ...(await catalog.checkPlainIntegrity(new Set(plainPaths), false)),
        ...(await catalog.checkCryptIntegrity(new Set(cryptPaths), false)),
      ]).toMatchInlineSnapshot(`[]`)

      catalog.reset([itemTable.C, itemTable.D])
      plainPaths = [itemTable.C.plainPath, itemTable.D.plainPath]
      cryptPaths = [
        ...itemTable.C.cryptPathParts.map(part => itemTable.C.cryptPath + part),
        ...itemTable.D.cryptPathParts.map(part => itemTable.D.cryptPath + part),
      ]
      expect([
        ...(await catalog.checkPlainIntegrity(new Set(plainPaths), false)),
        ...(await catalog.checkCryptIntegrity(new Set(cryptPaths), false)),
      ]).toMatchInlineSnapshot(`
        [
          "[ReadonlyCipherCatalog.checkPlainIntegrity] Missing plain file. (c.txt)",
          "[ReadonlyCipherCatalog.checkPlainIntegrity] Missing plain file. (d.txt)",
          "[ReadonlyCipherCatalog.checkCryptIntegrity] Missing crypt file part. (kirito/b597c635c06dd800a4ba92b66fc57b25695a09525c9cf0641eeb543dc3e15499.ghc-part1)",
          "[ReadonlyCipherCatalog.checkCryptIntegrity] Missing crypt file part. (kirito/d3d9283fe2e7959eaa7dac934fdc4aceea03b6478cbfe44fdffbd8aa4d7f8875.ghc-part1)",
        ]
      `)

      // Plain files exist but the crypt files not exist.
      await writeFile(absolutePlainPathC, contentC, encoding)
      await writeFile(absolutePlainPathD, contentD, encoding)
      expect([
        ...(await catalog.checkPlainIntegrity(new Set(plainPaths), false)),
        ...(await catalog.checkCryptIntegrity(new Set(cryptPaths), false)),
      ]).toMatchInlineSnapshot(`
        [
          "[ReadonlyCipherCatalog.checkCryptIntegrity] Missing crypt file part. (kirito/b597c635c06dd800a4ba92b66fc57b25695a09525c9cf0641eeb543dc3e15499.ghc-part1)",
          "[ReadonlyCipherCatalog.checkCryptIntegrity] Missing crypt file part. (kirito/d3d9283fe2e7959eaa7dac934fdc4aceea03b6478cbfe44fdffbd8aa4d7f8875.ghc-part1)",
        ]
      `)

      // Both plain files and crypt files are exist.
      for (let i = 0, size = 0; i < itemTable.C.cryptPathParts.length; ++i) {
        const part = itemTable.C.cryptPathParts[i]
        const absoluteEncryptedFilepath = cryptPathResolver.resolve(itemTable.C.cryptPath + part)
        if (i + 1 < itemTable.C.cryptPathParts.length) {
          await writeFile(absoluteEncryptedFilepath, 'c'.repeat(MAX_CRYPT_FILE_SIZE), encoding)
          size += MAX_CRYPT_FILE_SIZE
        } else {
          await writeFile(absoluteEncryptedFilepath, 'c'.repeat(itemTable.C.size - size), encoding)
        }
      }
      for (let i = 0, size = 0; i < itemTable.D.cryptPathParts.length; ++i) {
        const part = itemTable.D.cryptPathParts[i]
        const absoluteEncryptedFilepath = cryptPathResolver.resolve(itemTable.D.cryptPath + part)
        if (i + 1 < itemTable.C.cryptPathParts.length) {
          await writeFile(absoluteEncryptedFilepath, 'd'.repeat(MAX_CRYPT_FILE_SIZE), encoding)
          size += MAX_CRYPT_FILE_SIZE
        } else {
          await writeFile(absoluteEncryptedFilepath, 'd'.repeat(itemTable.D.size - size), encoding)
        }
      }
      expect([
        ...(await catalog.checkPlainIntegrity(new Set(plainPaths), false)),
        ...(await catalog.checkCryptIntegrity(new Set(cryptPaths), false)),
      ]).toMatchInlineSnapshot(`[]`)

      // Crypt files exist but the plain files not exist.
      await rm(absolutePlainPathC)
      await rm(absolutePlainPathD)
      expect([
        ...(await catalog.checkPlainIntegrity(new Set(plainPaths), false)),
        ...(await catalog.checkCryptIntegrity(new Set(cryptPaths), false)),
      ]).toMatchInlineSnapshot(`
        [
          "[ReadonlyCipherCatalog.checkPlainIntegrity] Missing plain file. (c.txt)",
          "[ReadonlyCipherCatalog.checkPlainIntegrity] Missing plain file. (d.txt)",
        ]
      `)
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

  // test('diffFromPlainFiles', async () => {
  //   const fileSplitter = new FileSplitter({ partCodePrefix: PART_CODE_PREFIX })
  //   const cipherFactory = new AesGcmCipherFactoryBuilder().buildFromPassword(
  //     Buffer.from('guanghechen', encoding),
  //     {
  //       salt: 'salt',
  //       iterations: 100000,
  //       digest: 'sha256',
  //     },
  //   )
  //   const fileCipherFactory = new FileCipherFactory({ cipherFactory, reporter })
  //   const cipherBatcher = new FileCipherBatcher({
  //     fileSplitter,
  //     fileCipherFactory,
  //     maxTargetFileSize: MAX_CRYPT_FILE_SIZE,
  //     reporter,
  //   })

  //   expect(Array.from(catalog.items)).toEqual([])

  //   // diffITems1
  //   {
  //     await writeFile(filepathA, contentA, encoding)
  //     await writeFile(filepathB, contentB, encoding)
  //     const draftDiffItems: IDraftCatalogDiffItem[] = await catalog.diffFromPlainFiles(
  //       [filepathA, filepathB],
  //       true,
  //     )
  //     const diffItems: ICatalogDiffItem[] = await cipherBatcher.batchEncrypt({
  //       catalog,
  //       diffItems: draftDiffItems,
  //       strictCheck: false,
  //     })

  //     expect(diffItems).toEqual(diffItemsTable.step1)
  //     expect(Array.from(catalog.items)).toEqual([])
  //     catalog.applyDiff(diffItems)
  //     expect(Array.from(catalog.items)).toEqual([itemTable.A, itemTable.B])
  //   }

  //   // corner case
  //   {
  //     await assertPromiseThrow(
  //       () => catalog.diffFromPlainFiles([filepathD], true),
  //       `is removed but it's not in the catalog before`,
  //     )

  //     expect(await catalog.diffFromPlainFiles([filepathD], false)).toEqual([])
  //   }

  //   // diffItems2
  //   {
  //     await rm(filepathA)
  //     await writeFile(filepathC, contentC, encoding)
  //     const draftDiffItems: IDraftCatalogDiffItem[] = await catalog.diffFromPlainFiles(
  //       [filepathA, filepathB, filepathC],
  //       true,
  //     )
  //     const diffItems: ICatalogDiffItem[] = await cipherBatcher.batchEncrypt({
  //       catalog,
  //       diffItems: draftDiffItems,
  //       strictCheck: false,
  //     })

  //     expect(diffItems).toEqual(diffItemsTable.step2)
  //     expect(Array.from(catalog.items)).toEqual([itemTable.A, itemTable.B])
  //     catalog.applyDiff(diffItems)
  //     expect(Array.from(catalog.items)).toEqual([itemTable.B, itemTable.C])
  //   }

  //   // diffItems3
  //   {
  //     await rm(filepathB)
  //     await writeFile(filepathA, contentA, encoding)
  //     const draftDiffItems: IDraftCatalogDiffItem[] = await catalog.diffFromPlainFiles(
  //       [filepathA, filepathB, filepathC],
  //       true,
  //     )
  //     const diffItems: ICatalogDiffItem[] = await cipherBatcher.batchEncrypt({
  //       catalog,
  //       diffItems: draftDiffItems,
  //       strictCheck: false,
  //     })

  //     expect(diffItems).toEqual(diffItemsTable.step3)
  //     expect(Array.from(catalog.items)).toEqual([itemTable.B, itemTable.C])
  //     catalog.applyDiff(diffItems)
  //     expect(Array.from(catalog.items)).toEqual([itemTable.C, itemTable.A])
  //   }

  //   // diffItems4
  //   {
  //     await rm(filepathC)
  //     await writeFile(filepathD, contentD, encoding)
  //     await writeFile(filepathA, contentA2, encoding)
  //     const draftDiffItems: IDraftCatalogDiffItem[] = await catalog.diffFromPlainFiles(
  //       [filepathA, filepathC, filepathD],
  //       true,
  //     )
  //     const diffItems: ICatalogDiffItem[] = await cipherBatcher.batchEncrypt({
  //       catalog,
  //       diffItems: draftDiffItems,
  //       strictCheck: false,
  //     })

  //     expect(diffItems).toEqual(diffItemsTable.step4)
  //     expect(Array.from(catalog.items)).toEqual([itemTable.C, itemTable.A])
  //     catalog.applyDiff(diffItems)
  //     expect(Array.from(catalog.items)).toEqual([itemTable.D, itemTable.A2])
  //   }

  //   // diffItems5
  //   {
  //     await rm(filepathA)
  //     await rm(filepathD)
  //     const draftDiffItems: IDraftCatalogDiffItem[] = await catalog.diffFromPlainFiles(
  //       [filepathD, filepathA],
  //       true,
  //     )
  //     const diffItems: ICatalogDiffItem[] = await cipherBatcher.batchEncrypt({
  //       catalog,
  //       diffItems: draftDiffItems,
  //       strictCheck: false,
  //     })

  //     expect(diffItems).toEqual(diffItemsTable.step5)
  //     expect(Array.from(catalog.items)).toEqual([itemTable.D, itemTable.A2])
  //     catalog.applyDiff(diffItems)
  //     expect(Array.from(catalog.items)).toEqual([])
  //   }
  // })

  test('find', async () => {
    catalog.reset([])
    expect(catalog.find(item => item.plainPath === 'a.txt')).toBe(undefined)

    catalog.reset([itemTable.A])
    expect(catalog.find(item => item.plainPath === 'a.txt')).toBe(itemTable.A)

    catalog.reset([itemTable.A2])
    expect(catalog.find(item => item.plainPath === 'a.txt')).toBe(itemTable.A2)

    catalog.reset([itemTable.B, itemTable.C, itemTable.D])
    expect(catalog.find(item => item.plainPath === 'a.txt')).toBe(undefined)
    expect(catalog.find(item => item.plainPath === 'b.txt')).toBe(itemTable.B)
    expect(catalog.find(item => item.plainPath === 'c.txt')).toBe(itemTable.C)
    expect(catalog.find(item => item.plainPath === 'd.txt')).toBe(itemTable.D)
  })

  test('flatItem', async () => {
    expect(await catalog.flatItem({ ...itemDraftTable.A, authTag: itemTable.A.authTag })).toEqual(
      itemTable.A,
    )
    expect(await catalog.flatItem({ ...itemDraftTable.A2, authTag: itemTable.A2.authTag })).toEqual(
      itemTable.A2,
    )
    expect(await catalog.flatItem({ ...itemDraftTable.B, authTag: itemTable.B.authTag })).toEqual(
      itemTable.B,
    )
    expect(await catalog.flatItem({ ...itemDraftTable.C, authTag: itemTable.C.authTag })).toEqual(
      itemTable.C,
    )
    expect(await catalog.flatItem({ ...itemDraftTable.D, authTag: itemTable.D.authTag })).toEqual(
      itemTable.D,
    )
  })

  test('get', async () => {
    catalog.reset([])
    expect(catalog.get('a.txt')).toBe(undefined)

    catalog.reset([itemTable.A])
    expect(catalog.get('a.txt')).toBe(itemTable.A)

    catalog.reset([itemTable.A2])
    expect(catalog.get('a.txt')).toBe(itemTable.A2)

    catalog.reset([itemTable.B, itemTable.C, itemTable.D])
    expect(catalog.get('a.txt')).toBe(undefined)
    expect(catalog.get('b.txt')).toBe(itemTable.B)
    expect(catalog.get('c.txt')).toBe(itemTable.C)
    expect(catalog.get('d.txt')).toBe(itemTable.D)
  })

  test('has', async () => {
    catalog.reset([])
    expect(catalog.has('a.txt')).toBe(false)

    catalog.reset([itemTable.A])
    expect(catalog.has('a.txt')).toBe(true)

    catalog.reset([itemTable.A2])
    expect(catalog.has('a.txt')).toBe(true)

    catalog.reset([itemTable.B, itemTable.C, itemTable.D])
    expect(catalog.has('a.txt')).toBe(false)
    expect(catalog.has('b.txt')).toBe(true)
    expect(catalog.has('c.txt')).toBe(true)
    expect(catalog.has('d.txt')).toBe(true)
  })
})
