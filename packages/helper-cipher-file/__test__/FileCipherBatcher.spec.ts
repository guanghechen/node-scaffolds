import ChalkLogger from '@guanghechen/chalk-logger'
import { AesGcmCipherFactory, calcMac } from '@guanghechen/helper-cipher'
import { BigFileHelper } from '@guanghechen/helper-file'
import { emptyDir, mkdirsIfNotExists, rm, writeFile } from '@guanghechen/helper-fs'
import { mergeStreams, stream2buffer } from '@guanghechen/helper-stream'
import { assertPromiseNotThrow, assertPromiseThrow, locateFixtures } from 'jest.helper'
import type { ReadStream } from 'node:fs'
import { createReadStream, existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { IFileCipherCatalogItemDiff, IFileCipherCatalogItemDraft } from '../src'
import {
  FileCipherBatcher,
  FileCipherFactory,
  FileCipherPathResolver,
  calcFingerprintFromMac,
  isSameFileCipherItemDraft,
} from '../src'
import {
  contentTable,
  diffItemsTable,
  encoding,
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
  const plainRootDir: string = path.join(workspaceDir, 'src')
  const cryptRootDir: string = path.join(workspaceDir, 'src_encrypted')
  const bakRootDir: string = path.join(workspaceDir, 'src_backup')
  const pathResolver = new FileCipherPathResolver({ plainRootDir, cryptRootDir })
  const bakPathResolver = new FileCipherPathResolver({ plainRootDir: bakRootDir, cryptRootDir })
  const logger = new ChalkLogger({ flags: { colorful: false, date: false } })

  const filepathA: string = pathResolver.calcAbsolutePlainFilepath(itemTable.A.plainFilepath)
  const filepathB: string = pathResolver.calcAbsolutePlainFilepath(itemTable.B.plainFilepath)
  const filepathC: string = pathResolver.calcAbsolutePlainFilepath(itemTable.C.plainFilepath)
  const filepathD: string = pathResolver.calcAbsolutePlainFilepath(itemTable.D.plainFilepath)

  const filepath2A: string = bakPathResolver.calcAbsolutePlainFilepath(itemTable.A.plainFilepath)
  const filepath2B: string = bakPathResolver.calcAbsolutePlainFilepath(itemTable.B.plainFilepath)
  const filepath2C: string = bakPathResolver.calcAbsolutePlainFilepath(itemTable.C.plainFilepath)
  const filepath2D: string = bakPathResolver.calcAbsolutePlainFilepath(itemTable.D.plainFilepath)

  const encryptedFilepathA: string = pathResolver.calcAbsoluteCryptFilepath(
    itemTable.A.cryptFilepath,
  )
  const encryptedFilepathA2: string = pathResolver.calcAbsoluteCryptFilepath(
    itemTable.A2.cryptFilepath,
  )
  const encryptedFilepathB: string = pathResolver.calcAbsoluteCryptFilepath(
    itemTable.B.cryptFilepath,
  )
  const encryptedFilepathsC: string[] = itemTable.C.cryptFileParts.map(part =>
    pathResolver.calcAbsoluteCryptFilepath(itemTable.C.cryptFilepath + part),
  )
  const encryptedFilepathsD: string[] = itemTable.D.cryptFileParts.map(part =>
    pathResolver.calcAbsoluteCryptFilepath(itemTable.D.cryptFilepath + part),
  )

  const contentA: string = contentTable.A
  const contentA2: string = contentTable.A2
  const contentB: string = contentTable.B
  const contentC: string = contentTable.C
  const contentD: string = contentTable.D

  const cryptContentFingerA = '4e26698e6bebd87fc210bec49fea4da6210b5769dbff50b3479effa16799120f'
  const cryptContentFingerA2 = '567d61041150b3ab51e448f37ad60d26bff2ffd8572fa4cd4cb15df75ccb4eab'
  const cryptContentFingerB = '7155dd86eeabef61d44b738ffb1cde7cbf955f4c75c82395193cd117722d91ea'
  const cryptContentFingerC = '1dfcd91be6d7a9b32cf42d8ef78544886302e3946810da8da4077d1c70374d66'
  const cryptContentFingerD = '40cb73b4c02d34812f38a5ca3a3f95d377285e83d7bb499573b918e1862bcf13'

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
        () =>
          cipherBatcher.batchEncrypt({
            strictCheck: true,
            pathResolver,
            diffItems,
            getIv,
          }),
        'Bad diff item (added), crypt file already exists.',
      )
      expect(existsSync(encryptedFilepathA)).toEqual(true)
      expect(existsSync(encryptedFilepathB)).toEqual(false)
      expect(encryptedFilepathsC.some(fp => existsSync(fp))).toEqual(false)
      expect(encryptedFilepathsD.some(fp => existsSync(fp))).toEqual(false)

      await cipherBatcher.batchEncrypt({
        strictCheck: false,
        pathResolver,
        diffItems,
        getIv,
      })

      expect(existsSync(encryptedFilepathA)).toEqual(true)
      expect(existsSync(encryptedFilepathB)).toEqual(true)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathA)).toEqual(cryptContentFingerA)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathB)).toEqual(cryptContentFingerB)
    }

    // diffItems2
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step2

      await writeFile(filepathC, contentC, encoding)
      await assertPromiseThrow(
        () =>
          cipherBatcher.batchEncrypt({
            strictCheck: true,
            pathResolver,
            diffItems,
            getIv,
          }),
        '[encryptDiff] Bad diff item (removed), plain file should not exist.',
      )

      expect(existsSync(encryptedFilepathA)).toEqual(true)
      expect(encryptedFilepathsC.some(fp => existsSync(fp))).toEqual(false)

      await rm(filepathA)
      await cipherBatcher.batchEncrypt({
        strictCheck: false,
        pathResolver,
        diffItems,
        getIv,
      })

      expect(existsSync(encryptedFilepathA)).toEqual(false)
      expect(existsSync(encryptedFilepathB)).toEqual(true)
      expect(encryptedFilepathsC.every(fp => existsSync(fp))).toEqual(true)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathB)).toEqual(cryptContentFingerB)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathsC)).toEqual(cryptContentFingerC)
    }

    // diffItems3
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step3

      await rm(filepathB)
      await writeFile(filepathA, contentA, encoding)
      await cipherBatcher.batchEncrypt({
        strictCheck: true,
        pathResolver,
        diffItems,
        getIv,
      })

      expect(existsSync(encryptedFilepathA)).toEqual(true)
      expect(existsSync(encryptedFilepathB)).toEqual(false)
      expect(encryptedFilepathsC.every(fp => existsSync(fp))).toEqual(true)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathA)).toEqual(cryptContentFingerA)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathsC)).toEqual(cryptContentFingerC)
    }

    // diffItems4
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step4

      await rm(filepathC)
      await writeFile(filepathD, contentD, encoding)
      await writeFile(filepathA, contentA2, encoding)
      await cipherBatcher.batchEncrypt({
        strictCheck: true,
        pathResolver,
        diffItems,
        getIv,
      })

      expect(existsSync(encryptedFilepathA)).toEqual(false)
      expect(existsSync(encryptedFilepathA2)).toEqual(true)
      expect(encryptedFilepathsC.some(fp => existsSync(fp))).toEqual(false)
      expect(encryptedFilepathsD.every(fp => existsSync(fp))).toEqual(true)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathA2)).toEqual(cryptContentFingerA2)
      expect(await getFingerprintOfEncryptedFile(encryptedFilepathsD)).toEqual(cryptContentFingerD)
    }

    // diffItems5
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step5

      await rm(filepathA)
      await rm(filepathD)
      await cipherBatcher.batchEncrypt({
        strictCheck: true,
        pathResolver,
        diffItems,
        getIv,
      })

      expect(existsSync(encryptedFilepathA)).toEqual(false)
      expect(existsSync(encryptedFilepathA2)).toEqual(false)
      expect(encryptedFilepathsC.some(fp => existsSync(fp))).toEqual(false)
      expect(encryptedFilepathsD.some(fp => existsSync(fp))).toEqual(false)
    }
  })

  test('batchDecrypt', async () => {
    // diffItems1
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step1

      await writeFile(filepathA, contentA, encoding)
      await writeFile(filepathB, contentB, encoding)
      await cipherBatcher.batchEncrypt({
        strictCheck: false,
        pathResolver,
        diffItems,
        getIv,
      })

      mkdirsIfNotExists(filepath2A, true)
      await assertPromiseThrow(
        () =>
          cipherBatcher.batchDecrypt({
            strictCheck: true,
            pathResolver: bakPathResolver,
            diffItems,
          }),
        'Bad diff item (added), plain file already exists.',
      )
      expect(existsSync(filepath2A)).toEqual(true)
      expect(existsSync(filepath2B)).toEqual(false)

      await cipherBatcher.batchDecrypt({
        strictCheck: false,
        pathResolver: bakPathResolver,
        diffItems,
      })
      expect(existsSync(filepath2A)).toEqual(true)
      expect(existsSync(filepath2B)).toEqual(true)
      expect(await fs.readFile(filepath2A, encoding)).toEqual(contentA)
      expect(await fs.readFile(filepath2B, encoding)).toEqual(contentB)
    }

    // diffItems2
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step2

      await assertPromiseThrow(
        () =>
          cipherBatcher.batchDecrypt({
            strictCheck: true,
            pathResolver: bakPathResolver,
            diffItems,
          }),
        'Bad diff item (REMOVED), crypt file should not exist.',
      )

      await rm(filepathA)
      await writeFile(filepathC, contentC, encoding)
      await cipherBatcher.batchEncrypt({
        strictCheck: false,
        pathResolver,
        diffItems,
        getIv,
      })

      await cipherBatcher.batchDecrypt({
        strictCheck: true,
        pathResolver: bakPathResolver,
        diffItems,
      })
      expect(existsSync(filepath2A)).toEqual(false)
      expect(existsSync(filepath2B)).toEqual(true)
      expect(existsSync(filepath2C)).toEqual(true)
      expect(await fs.readFile(filepath2B, encoding)).toEqual(contentB)
      expect(await fs.readFile(filepath2C, encoding)).toEqual(contentC)

      await assertPromiseThrow(
        () =>
          cipherBatcher.batchDecrypt({
            strictCheck: true,
            pathResolver: bakPathResolver,
            diffItems,
          }),
        'Bad diff item (removed), plain file does not exist or it is not a file.',
      )
      await assertPromiseNotThrow(() =>
        cipherBatcher.batchDecrypt({
          strictCheck: false,
          pathResolver: bakPathResolver,
          diffItems,
        }),
      )
    }

    // diffItems3
    {
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step3

      await rm(filepathB)
      await writeFile(filepathA, contentA, encoding)
      await cipherBatcher.batchEncrypt({
        strictCheck: true,
        pathResolver,
        diffItems,
        getIv,
      })

      await cipherBatcher.batchDecrypt({
        strictCheck: true,
        pathResolver: bakPathResolver,
        diffItems,
      })
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
      await cipherBatcher.batchEncrypt({
        strictCheck: true,
        pathResolver,
        diffItems,
        getIv,
      })

      await cipherBatcher.batchDecrypt({
        strictCheck: true,
        pathResolver: bakPathResolver,
        diffItems,
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
      const diffItems: IFileCipherCatalogItemDiff[] = diffItemsTable.step5

      await rm(filepathA)
      await rm(filepathD)
      await cipherBatcher.batchEncrypt({
        strictCheck: true,
        pathResolver,
        diffItems,
        getIv,
      })

      await cipherBatcher.batchDecrypt({
        strictCheck: true,
        pathResolver: bakPathResolver,
        diffItems,
      })
      expect(existsSync(filepath2A)).toEqual(false)
      expect(existsSync(filepath2B)).toEqual(false)
      expect(existsSync(filepath2C)).toEqual(false)
      expect(existsSync(filepath2D)).toEqual(false)
    }
  })
})
