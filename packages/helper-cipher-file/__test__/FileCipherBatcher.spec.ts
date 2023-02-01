import ChalkLogger from '@guanghechen/chalk-logger'
import { AesCipherFactory } from '@guanghechen/helper-cipher'
import { BigFileHelper } from '@guanghechen/helper-file'
import { emptyDir, mkdirsIfNotExists, rm, writeFile } from '@guanghechen/helper-fs'
import { falsy } from '@guanghechen/helper-func'
import { mergeStreams, stream2buffer } from '@guanghechen/helper-stream'
import { assertPromiseNotThrow, assertPromiseThrow, locateFixtures } from 'jest.helper'
import type { ReadStream } from 'node:fs'
import { createReadStream, existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { IFileCipherCatalogItemDiff } from '../src'
import {
  FileCipher,
  FileCipherBatcher,
  FileCipherCatalog,
  FileCipherPathResolver,
  calcFingerprintFromMac,
  calcMac,
} from '../src'
import {
  contentTable,
  diffItemsTable,
  encoding,
  encryptedDir,
  itemTable,
  maxTargetFileSize,
  partCodePrefix,
} from './_data'

const getFingerprintOfEncryptedFile = async (filePartPaths: string | string[]): Promise<string> => {
  const streams: ReadStream[] = [filePartPaths].flat().map(fp => createReadStream(fp))
  const stream = mergeStreams(streams)
  const buffer: Buffer = await stream2buffer(stream, false)
  const mac: Buffer = calcMac(buffer)
  return calcFingerprintFromMac(mac)
}

describe('FileCipherBatcher', () => {
  const workspaceDir: string = locateFixtures('__fictitious__.FileCipherBatcher')
  const sourceRootDir: string = path.join(workspaceDir, 'src')
  const encryptedRootDir: string = path.join(workspaceDir, 'src_encrypted')
  const bakRootDir: string = path.join(workspaceDir, 'src_backup')
  const pathResolver = new FileCipherPathResolver({ sourceRootDir, encryptedRootDir })
  const pathResolver2 = new FileCipherPathResolver({ sourceRootDir: bakRootDir, encryptedRootDir })
  const logger = new ChalkLogger({ flags: { colorful: false, date: false } })

  const filepathA: string = pathResolver.calcAbsoluteSourceFilepath(itemTable.A.sourceFilepath)
  const filepathB: string = pathResolver.calcAbsoluteSourceFilepath(itemTable.B.sourceFilepath)
  const filepathC: string = pathResolver.calcAbsoluteSourceFilepath(itemTable.C.sourceFilepath)
  const filepathD: string = pathResolver.calcAbsoluteSourceFilepath(itemTable.D.sourceFilepath)

  const filepath2A: string = pathResolver2.calcAbsoluteSourceFilepath(itemTable.A.sourceFilepath)
  const filepath2B: string = pathResolver2.calcAbsoluteSourceFilepath(itemTable.B.sourceFilepath)
  const filepath2C: string = pathResolver2.calcAbsoluteSourceFilepath(itemTable.C.sourceFilepath)
  const filepath2D: string = pathResolver2.calcAbsoluteSourceFilepath(itemTable.D.sourceFilepath)

  const encryptedFilepathA: string = pathResolver.calcAbsoluteEncryptedFilepath(
    itemTable.A.encryptedFilepath,
  )
  const encryptedFilepathA2: string = pathResolver.calcAbsoluteEncryptedFilepath(
    itemTable.A2.encryptedFilepath,
  )
  const encryptedFilepathB: string = pathResolver.calcAbsoluteEncryptedFilepath(
    itemTable.B.encryptedFilepath,
  )
  const encryptedFilepathsC: string[] = itemTable.C.encryptedFileParts.map(part =>
    pathResolver.calcAbsoluteEncryptedFilepath(itemTable.C.encryptedFilepath + part),
  )
  const encryptedFilepathsD: string[] = itemTable.D.encryptedFileParts.map(part =>
    pathResolver.calcAbsoluteEncryptedFilepath(itemTable.D.encryptedFilepath + part),
  )

  const contentA: string = contentTable.A
  const contentA2: string = contentTable.A2
  const contentB: string = contentTable.B
  const contentC: string = contentTable.C
  const contentD: string = contentTable.D

  const encryptedContentA = '4e26698e6bebd87fc210bec49fea4da6210b5769dbff50b3479effa16799120f'
  const encryptedContentA2 = '6db6b129442504d166272af62c8f5a25f72a9453ad7c81b8c65c6a8756d6c748'
  const encryptedContentB = '03bfec097ce7735e27c4fc25c798f89b30af7e4a15bab67beebb9f6b13e37c7f'
  const encryptedContentC = '8830d19592102790c1d37f4fd355f712b9baaf48385e2ba97d413261ab829aac'
  const encryptedContentD = '40cb73b4c02d34812f38a5ca3a3f95d377285e83d7bb499573b918e1862bcf13'

  const fileHelper = new BigFileHelper({ partCodePrefix: partCodePrefix })
  const cipherFactory = new AesCipherFactory()
  const cipher = cipherFactory.initFromPassword(Buffer.from('guanghechen', encoding), {
    salt: 'salt',
    iterations: 100000,
    keylen: 32,
    digest: 'sha256',
  })
  const fileCipher = new FileCipher({ cipher })
  const catalog = new FileCipherCatalog({
    pathResolver,
    maxTargetFileSize,
    partCodePrefix,
    encryptedDir,
    logger,
    isKeepPlain: falsy,
  })
  const cipherBatcher = new FileCipherBatcher({
    fileCipher,
    fileHelper,
    pathResolver,
    maxTargetFileSize: 1024,
    logger,
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
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step1

      await writeFile(filepathA, contentA, encoding)
      await writeFile(filepathB, contentB, encoding)
      expect(existsSync(filepathA)).toEqual(true)
      expect(existsSync(filepathB)).toEqual(true)

      mkdirsIfNotExists(encryptedFilepathA, true)

      await assertPromiseThrow(
        () => cipherBatcher.batchEncrypt({ strictCheck: true, diffItems }),
        'Bad diff item (added), encrypted file already exists.',
      )
      expect(existsSync(encryptedFilepathA)).toEqual(true)
      expect(existsSync(encryptedFilepathB)).toEqual(false)
      expect(encryptedFilepathsC.some(fp => existsSync(fp))).toEqual(false)
      expect(encryptedFilepathsD.some(fp => existsSync(fp))).toEqual(false)

      await cipherBatcher.batchEncrypt({ strictCheck: false, diffItems })

      expect(existsSync(encryptedFilepathA)).toEqual(true)
      expect(existsSync(encryptedFilepathB)).toEqual(true)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathA)).toEqual(encryptedContentA)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathB)).toEqual(encryptedContentB)
    }

    // diffItems2
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step2

      await writeFile(filepathC, contentC, encoding)
      await assertPromiseThrow(
        () => cipherBatcher.batchEncrypt({ strictCheck: true, diffItems }),
        '[encryptDiff] Bad diff item (removed), source file should not exist.',
      )

      expect(existsSync(encryptedFilepathA)).toEqual(true)
      expect(encryptedFilepathsC.some(fp => existsSync(fp))).toEqual(false)

      await rm(filepathA)
      await cipherBatcher.batchEncrypt({ strictCheck: false, diffItems })

      expect(existsSync(encryptedFilepathA)).toEqual(false)
      expect(existsSync(encryptedFilepathB)).toEqual(true)
      expect(encryptedFilepathsC.every(fp => existsSync(fp))).toEqual(true)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathB)).toEqual(encryptedContentB)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathsC)).toEqual(encryptedContentC)
    }

    // diffItems3
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step3

      await rm(filepathB)
      await writeFile(filepathA, contentA, encoding)
      await cipherBatcher.batchEncrypt({ strictCheck: true, diffItems })

      expect(existsSync(encryptedFilepathA)).toEqual(true)
      expect(existsSync(encryptedFilepathB)).toEqual(false)
      expect(encryptedFilepathsC.every(fp => existsSync(fp))).toEqual(true)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathA)).toEqual(encryptedContentA)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathsC)).toEqual(encryptedContentC)
    }

    // diffItems4
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step4

      await rm(filepathC)
      await writeFile(filepathD, contentD, encoding)
      await writeFile(filepathA, contentA2, encoding)
      await cipherBatcher.batchEncrypt({ strictCheck: true, diffItems })

      expect(existsSync(encryptedFilepathA)).toEqual(false)
      expect(existsSync(encryptedFilepathA2)).toEqual(true)
      expect(encryptedFilepathsC.some(fp => existsSync(fp))).toEqual(false)
      expect(encryptedFilepathsD.every(fp => existsSync(fp))).toEqual(true)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathA2)).toEqual(encryptedContentA2)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathsD)).toEqual(encryptedContentD)
    }

    // diffItems5
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step5

      await rm(filepathA)
      await rm(filepathD)
      await cipherBatcher.batchEncrypt({ strictCheck: true, diffItems })

      expect(existsSync(encryptedFilepathA)).toEqual(false)
      expect(existsSync(encryptedFilepathA2)).toEqual(false)
      expect(encryptedFilepathsC.some(fp => existsSync(fp))).toEqual(false)
      expect(encryptedFilepathsD.some(fp => existsSync(fp))).toEqual(false)
    }
  })

  test('batchDecrypt', async () => {
    const cipherBatcher2 = new FileCipherBatcher({
      fileCipher,
      fileHelper,
      pathResolver: pathResolver2,
      maxTargetFileSize: catalog.maxTargetFileSize,
      logger,
    })

    // diffItems1
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step1

      await writeFile(filepathA, contentA, encoding)
      await writeFile(filepathB, contentB, encoding)
      await cipherBatcher.batchEncrypt({ strictCheck: false, diffItems })

      mkdirsIfNotExists(filepath2A, true)
      await assertPromiseThrow(
        () => cipherBatcher2.batchDecrypt({ strictCheck: true, diffItems }),
        'Bad diff item (added), source file already exists.',
      )
      expect(existsSync(filepath2A)).toEqual(true)
      expect(existsSync(filepath2B)).toEqual(false)

      await cipherBatcher2.batchDecrypt({ strictCheck: false, diffItems })
      expect(existsSync(filepath2A)).toEqual(true)
      expect(existsSync(filepath2B)).toEqual(true)
      expect(await fs.readFile(filepath2A, encoding)).toEqual(contentA)
      expect(await fs.readFile(filepath2B, encoding)).toEqual(contentB)
    }

    // diffItems2
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step2

      await assertPromiseThrow(
        () => cipherBatcher2.batchDecrypt({ strictCheck: true, diffItems }),
        'Bad diff item (REMOVED), encrypted file should not exist.',
      )

      await rm(filepathA)
      await writeFile(filepathC, contentC, encoding)
      await cipherBatcher.batchEncrypt({ strictCheck: false, diffItems })

      await cipherBatcher2.batchDecrypt({ strictCheck: true, diffItems })
      expect(existsSync(filepath2A)).toEqual(false)
      expect(existsSync(filepath2B)).toEqual(true)
      expect(existsSync(filepath2C)).toEqual(true)
      expect(await fs.readFile(filepath2B, encoding)).toEqual(contentB)
      expect(await fs.readFile(filepath2C, encoding)).toEqual(contentC)

      await assertPromiseThrow(
        () => cipherBatcher2.batchDecrypt({ strictCheck: true, diffItems }),
        'Bad diff item (removed), source file does not exist or it is not a file.',
      )
      await assertPromiseNotThrow(() =>
        cipherBatcher2.batchDecrypt({ strictCheck: false, diffItems }),
      )
    }

    // diffItems3
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step3

      await rm(filepathB)
      await writeFile(filepathA, contentA, encoding)
      await cipherBatcher.batchEncrypt({ strictCheck: true, diffItems })

      await cipherBatcher2.batchDecrypt({ strictCheck: true, diffItems })
      expect(existsSync(filepath2A)).toEqual(true)
      expect(existsSync(filepath2B)).toEqual(false)
      expect(existsSync(filepath2C)).toEqual(true)
      expect(await fs.readFile(filepath2A, encoding)).toEqual(contentA)
      expect(await fs.readFile(filepath2C, encoding)).toEqual(contentC)
    }

    // diffItems4
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step4

      await rm(filepathC)
      await writeFile(filepathD, contentD, encoding)
      await writeFile(filepathA, contentA2, encoding)
      await cipherBatcher.batchEncrypt({ strictCheck: true, diffItems })

      await cipherBatcher2.batchDecrypt({ strictCheck: true, diffItems })
      expect(existsSync(filepath2A)).toEqual(true)
      expect(existsSync(filepath2B)).toEqual(false)
      expect(existsSync(filepath2C)).toEqual(false)
      expect(existsSync(filepath2D)).toEqual(true)
      expect(await fs.readFile(filepath2A, encoding)).toEqual(contentA2)
      expect(await fs.readFile(filepath2D, encoding)).toEqual(contentD)
    }

    // diffItems5
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step5

      await rm(filepathA)
      await rm(filepathD)
      await cipherBatcher.batchEncrypt({ strictCheck: true, diffItems })

      await cipherBatcher2.batchDecrypt({ strictCheck: true, diffItems })
      expect(existsSync(filepath2A)).toEqual(false)
      expect(existsSync(filepath2B)).toEqual(false)
      expect(existsSync(filepath2C)).toEqual(false)
      expect(existsSync(filepath2D)).toEqual(false)
    }
  })
})
