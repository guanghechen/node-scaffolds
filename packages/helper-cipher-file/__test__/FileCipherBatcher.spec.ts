import { text2bytes } from '@guanghechen/byte'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { chalk } from '@guanghechen/chalk/node'
import type { ICipherFactory } from '@guanghechen/cipher'
import { AesGcmCipherFactoryBuilder } from '@guanghechen/cipher'
import { calcFingerprintFromMac } from '@guanghechen/cipher-catalog'
import type {
  ICatalogDiffItem,
  ICatalogDiffItemCombine,
  ICatalogItem,
} from '@guanghechen/cipher-catalog.types'
import type { IFileSplitter } from '@guanghechen/file-split'
import { FileSplitter } from '@guanghechen/file-split'
import { calcMac } from '@guanghechen/mac'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import { Reporter } from '@guanghechen/reporter'
import { mergeStreams, stream2buffer } from '@guanghechen/stream'
import {
  assertPromiseThrow,
  emptyDir,
  locateFixtures,
  mkdirsIfNotExists,
  rm,
  writeFile,
} from 'jest.helper'
import type { ReadStream } from 'node:fs'
import { createReadStream, existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { IFileCipherBatcher, IFileCipherFactory } from '../src'
import { FileCipherBatcher, FileCipherFactory } from '../src'
import {
  CONTENT_HASH_ALGORITHM,
  MAX_CRYPT_FILE_SIZE,
  PART_CODE_PREFIX,
  contentTable,
  diffItemsTable,
  encoding,
  itemTable,
} from './_data'

const getFingerprintOfEncryptedFile = async (filePartPaths: string | string[]): Promise<string> => {
  const streams: ReadStream[] = [filePartPaths].flat().map(fp => createReadStream(fp))
  const stream = mergeStreams(streams)
  const buffer: Buffer = await stream2buffer(stream, false)
  const mac: Uint8Array = calcMac([buffer], CONTENT_HASH_ALGORITHM)
  return calcFingerprintFromMac(mac)
}

describe('FileCipherBatcher', () => {
  const workspaceDir: string = locateFixtures('__fictitious__.FileCipherBatcher')
  const plainRootDir: string = path.join(workspaceDir, 'plain')
  const cryptRootDir: string = path.join(workspaceDir, 'crypt')
  const bakPlainRootDir: string = path.join(workspaceDir, 'plain-bak')
  const plainPathResolver = new WorkspacePathResolver(plainRootDir, pathResolver)
  const cryptPathResolver = new WorkspacePathResolver(cryptRootDir, pathResolver)
  const bakPlainPathResolver = new WorkspacePathResolver(bakPlainRootDir, pathResolver)
  const reporter = new Reporter(chalk, { flights: { colorful: false, date: false } })

  const filepathA: string = plainPathResolver.resolve(itemTable.A.plainPath)
  const filepathB: string = plainPathResolver.resolve(itemTable.B.plainPath)
  const filepathC: string = plainPathResolver.resolve(itemTable.C.plainPath)
  const filepathD: string = plainPathResolver.resolve(itemTable.D.plainPath)

  const filepath2A: string = bakPlainPathResolver.resolve(itemTable.A.plainPath)
  const filepath2B: string = bakPlainPathResolver.resolve(itemTable.B.plainPath)
  const filepath2C: string = bakPlainPathResolver.resolve(itemTable.C.plainPath)
  const filepath2D: string = bakPlainPathResolver.resolve(itemTable.D.plainPath)

  const absoluteCryptPathA: string = cryptPathResolver.resolve(itemTable.A.cryptPath)
  const absoluteCryptPathA2: string = cryptPathResolver.resolve(itemTable.A2.cryptPath)
  const absoluteCryptPathB: string = cryptPathResolver.resolve(itemTable.B.cryptPath)
  const absoluteCryptPathsC: string[] = itemTable.C.cryptPathParts.map(part =>
    cryptPathResolver.resolve(itemTable.C.cryptPath + part),
  )
  const absoluteCryptPathsD: string[] = itemTable.D.cryptPathParts.map(part =>
    cryptPathResolver.resolve(itemTable.D.cryptPath + part),
  )

  const contentA: string = contentTable.A
  const contentA2: string = contentTable.A2
  const contentB: string = contentTable.B
  const contentC: string = contentTable.C
  const contentD: string = contentTable.D

  const cryptContentFingerA = '4e26698e6bebd87fc210bec49fea4da6210b5769dbff50b3479effa16799120f'
  const cryptContentFingerA2 = '70b47f9cc28ad379043b328d7d058097c69e7bb38d766ecca2655cd3afb6b5fa'
  const cryptContentFingerB = '205c2fb8827737958506bfe634713d5f38d155f0bf2beb3e9ab5c8e86fd195d1'
  const cryptContentFingerC = 'f33f240ebc889a7910c46ad1bf9286e36f4e782a943b1d9255b9c491f2b507b4'
  const cryptContentFingerD = '8744cc667a27aab7178770d92b38b55dd44308448c6b8a595220bf4946d25fc7'

  let cipherFactory: ICipherFactory
  let fileCipherBatcher: IFileCipherBatcher
  let fileCipherFactory: IFileCipherFactory
  let fileSplitter: IFileSplitter

  beforeAll(() => {
    fileSplitter = new FileSplitter({ partCodePrefix: PART_CODE_PREFIX })
    cipherFactory = new AesGcmCipherFactoryBuilder().buildFromPassword(
      Uint8Array.from(Buffer.from('guanghechen', encoding)),
      {
        salt: 'salt',
        iterations: 100000,
        digest: 'sha256',
      },
    )
    fileCipherFactory = new FileCipherFactory({ cipherFactory, reporter })
    fileCipherBatcher = new FileCipherBatcher({
      MAX_CRYPT_FILE_SIZE,
      PART_CODE_PREFIX,
      fileSplitter,
      fileCipherFactory,
      reporter,
      genNonce: async item =>
        Object.values(itemTable).find(
          t => t.plainPath === item.plainPath && t.fingerprint === item.fingerprint,
        )?.nonce ?? text2bytes('af5e87dbe9a86c24d35df07e5151bb76', 'hex'),
    })
  })

  beforeEach(async () => {
    await emptyDir(workspaceDir)
  })

  afterEach(async () => {
    await rm(workspaceDir)
  })

  test('batchEncrypt', async () => {
    expect(existsSync(filepathA)).toEqual(false)
    expect(existsSync(filepathB)).toEqual(false)
    expect(existsSync(filepathC)).toEqual(false)
    expect(existsSync(filepathD)).toEqual(false)

    // diffItem1
    {
      const diffItems: ICatalogDiffItem[] = diffItemsTable.step1

      await writeFile(filepathA, contentA, encoding)
      await writeFile(filepathB, contentB, encoding)
      expect(existsSync(filepathA)).toEqual(true)
      expect(existsSync(filepathB)).toEqual(true)

      mkdirsIfNotExists(absoluteCryptPathA, true)

      await assertPromiseThrow(
        () =>
          fileCipherBatcher.batchEncryptByDiffItems({
            diffItems,
            cryptPathResolver,
            plainPathResolver,
          }),
        'the crypt file is not a file.',
      )
      expect(existsSync(absoluteCryptPathA)).toEqual(true)
      expect(existsSync(absoluteCryptPathB)).toEqual(false)
      expect(absoluteCryptPathsC.some(fp => existsSync(fp))).toEqual(false)
      expect(absoluteCryptPathsD.some(fp => existsSync(fp))).toEqual(false)

      await rm(absoluteCryptPathA)

      const items: ICatalogItem[] = await fileCipherBatcher.batchEncryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver,
      })
      expect(items.map(item => item.plainPath)).toEqual([
        itemTable.A.plainPath,
        itemTable.B.plainPath,
      ])
      expect(existsSync(absoluteCryptPathA)).toEqual(true)
      expect(existsSync(absoluteCryptPathB)).toEqual(true)
      expect(await getFingerprintOfEncryptedFile(absoluteCryptPathA)).toEqual(cryptContentFingerA)
      expect(await getFingerprintOfEncryptedFile(absoluteCryptPathB)).toEqual(cryptContentFingerB)
    }

    // diffItems2
    {
      const diffItems: ICatalogDiffItem[] = diffItemsTable.step2

      await writeFile(filepathC, contentC, encoding)

      const items: ICatalogItem[] = await fileCipherBatcher.batchEncryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver,
      })

      expect(items.map(item => item.plainPath)).toEqual([itemTable.C.plainPath])
      expect(existsSync(absoluteCryptPathA)).toEqual(false)
      expect(existsSync(absoluteCryptPathB)).toEqual(true)
      expect(absoluteCryptPathsC.every(fp => existsSync(fp))).toEqual(true)
      expect(await getFingerprintOfEncryptedFile(absoluteCryptPathB)).toEqual(cryptContentFingerB)
      expect(await getFingerprintOfEncryptedFile(absoluteCryptPathsC)).toEqual(cryptContentFingerC)
    }

    // diffItems3
    {
      const diffItems: ICatalogDiffItem[] = diffItemsTable.step3

      await rm(filepathB)
      await writeFile(filepathA, contentA, encoding)
      await fileCipherBatcher.batchEncryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver,
      })

      expect(existsSync(absoluteCryptPathA)).toEqual(true)
      expect(existsSync(absoluteCryptPathB)).toEqual(false)
      expect(absoluteCryptPathsC.every(fp => existsSync(fp))).toEqual(true)
      expect(await getFingerprintOfEncryptedFile(absoluteCryptPathA)).toEqual(cryptContentFingerA)
      expect(await getFingerprintOfEncryptedFile(absoluteCryptPathsC)).toEqual(cryptContentFingerC)
    }

    // diffItems4
    {
      const diffItems: ICatalogDiffItem[] = diffItemsTable.step4

      await rm(filepathC)
      await writeFile(filepathD, contentD, encoding)
      await writeFile(filepathA, contentA2, encoding)
      await fileCipherBatcher.batchEncryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver,
      })

      expect(existsSync(absoluteCryptPathA2)).toEqual(true)
      expect(absoluteCryptPathsC.some(fp => existsSync(fp))).toEqual(false)
      expect(absoluteCryptPathsD.every(fp => existsSync(fp))).toEqual(true)
      expect(await getFingerprintOfEncryptedFile(absoluteCryptPathA2)).toEqual(cryptContentFingerA2)
      expect(await getFingerprintOfEncryptedFile(absoluteCryptPathsD)).toEqual(cryptContentFingerD)
    }

    // diffItems5
    {
      const diffItems: ICatalogDiffItem[] = diffItemsTable.step5

      await rm(filepathA)
      await rm(filepathD)
      await fileCipherBatcher.batchEncryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver,
      })

      expect(existsSync(absoluteCryptPathA)).toEqual(false)
      expect(existsSync(absoluteCryptPathA2)).toEqual(false)
      expect(absoluteCryptPathsC.some(fp => existsSync(fp))).toEqual(false)
      expect(absoluteCryptPathsD.some(fp => existsSync(fp))).toEqual(false)
    }
  })

  test('batchDecrypt', async () => {
    // diffItems1
    {
      const diffItems: ICatalogDiffItem[] = diffItemsTable.step1

      await writeFile(filepathA, contentA, encoding)
      await writeFile(filepathB, contentB, encoding)
      await fileCipherBatcher.batchEncryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver,
      })

      mkdirsIfNotExists(filepath2A, true)

      await assertPromiseThrow(
        () =>
          fileCipherBatcher.batchDecryptByDiffItems({
            diffItems,
            cryptPathResolver,
            plainPathResolver: bakPlainPathResolver,
          }),
        'the plain file is not a file.',
      )
      expect(existsSync(filepath2A)).toEqual(true)
      expect(existsSync(filepath2B)).toEqual(false)

      await rm(filepath2A)

      await fileCipherBatcher.batchDecryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver: bakPlainPathResolver,
      })

      expect(existsSync(filepath2A)).toEqual(true)
      expect(existsSync(filepath2B)).toEqual(true)
      expect(await fs.readFile(filepath2A, encoding)).toEqual(contentA)
      expect(await fs.readFile(filepath2B, encoding)).toEqual(contentB)
    }

    // diffItems2
    {
      const diffItems: ICatalogDiffItem[] = diffItemsTable.step2

      await assertPromiseThrow(
        () =>
          fileCipherBatcher.batchDecryptByDiffItems({
            diffItems,
            cryptPathResolver,
            plainPathResolver: bakPlainPathResolver,
          }),
        'Bad item, crypt file does not exist or it is not a file.',
      )

      await rm(filepathA)
      await writeFile(filepathC, contentC, encoding)
      mkdirsIfNotExists(filepath2C, true)

      await assertPromiseThrow(
        () =>
          fileCipherBatcher.batchDecryptByDiffItems({
            diffItems,
            cryptPathResolver,
            plainPathResolver: bakPlainPathResolver,
          }),
        'the plain file is not a file.',
      )
      await assertPromiseThrow(
        () =>
          fileCipherBatcher.batchDecrypt({
            items: diffItems
              .map(item => (item as ICatalogDiffItemCombine).newItem)
              .filter(Boolean) as ICatalogItem[],
            cryptPathResolver,
            plainPathResolver: bakPlainPathResolver,
          }),
        'Bad item, plain file already exists and it is not a file.',
      )

      await rm(filepath2C)

      await fileCipherBatcher.batchEncryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver,
      })
      await fileCipherBatcher.batchDecryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver: bakPlainPathResolver,
      })

      expect(existsSync(filepath2A)).toEqual(false)
      expect(existsSync(filepath2B)).toEqual(true)
      expect(existsSync(filepath2C)).toEqual(true)
      expect(await fs.readFile(filepath2B, encoding)).toEqual(contentB)
      expect(await fs.readFile(filepath2C, encoding)).toEqual(contentC)

      await fileCipherBatcher.batchDecryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver: bakPlainPathResolver,
      })
    }

    // diffItems3
    {
      const diffItems: ICatalogDiffItem[] = diffItemsTable.step3

      await rm(filepathB)
      await writeFile(filepathA, contentA, encoding)
      await fileCipherBatcher.batchEncryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver,
      })
      await fileCipherBatcher.batchDecryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver: bakPlainPathResolver,
      })

      expect(existsSync(filepath2A)).toEqual(true)
      expect(existsSync(filepath2B)).toEqual(false)
      expect(existsSync(filepath2C)).toEqual(true)
      expect(await fs.readFile(filepath2A, encoding)).toEqual(contentA)
      expect(await fs.readFile(filepath2C, encoding)).toEqual(contentC)
    }

    // diffItems4
    {
      const diffItems: ICatalogDiffItem[] = diffItemsTable.step4

      await rm(filepathC)
      await writeFile(filepathD, contentD, encoding)
      await writeFile(filepathA, contentA2, encoding)
      await fileCipherBatcher.batchEncryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver,
      })
      await fileCipherBatcher.batchDecryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver: bakPlainPathResolver,
      })

      expect(existsSync(filepath2A)).toEqual(true)
      expect(existsSync(filepath2B)).toEqual(false)
      expect(existsSync(filepath2C)).toEqual(false)
      expect(existsSync(filepath2D)).toEqual(true)
      expect(await fs.readFile(filepath2A, encoding)).toEqual(contentA2)
      expect(await fs.readFile(filepath2D, encoding)).toEqual(contentD)
    }

    // diffItems5
    {
      const diffItems: ICatalogDiffItem[] = diffItemsTable.step5

      await rm(filepathA)
      await rm(filepathD)
      await fileCipherBatcher.batchEncryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver,
      })
      await fileCipherBatcher.batchDecryptByDiffItems({
        diffItems,
        cryptPathResolver,
        plainPathResolver: bakPlainPathResolver,
      })

      expect(existsSync(filepath2A)).toEqual(false)
      expect(existsSync(filepath2B)).toEqual(false)
      expect(existsSync(filepath2C)).toEqual(false)
      expect(existsSync(filepath2D)).toEqual(false)
    }
  })
})
