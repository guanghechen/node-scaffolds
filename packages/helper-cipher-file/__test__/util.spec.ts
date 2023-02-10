import { calcMac } from '@guanghechen/helper-cipher'
import { locateFixtures } from 'jest.helper'
import path from 'node:path'
import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDiffDraft,
  IFileCipherCatalogItemDraft,
} from '../src'
import {
  FileChangeType,
  FileCipherPathResolver,
  calcFingerprintFromFile,
  calcFingerprintFromMac,
  calcFingerprintFromString,
  calcMacFromFile,
  collectAffectedCryptFilepaths,
  collectAffectedPlainFilepaths,
  isSameFileCipherItem,
  isSameFileCipherItemDraft,
  normalizePlainFilepath,
} from '../src'
import { itemTable } from './_data'

describe('catalog', () => {
  const sourceRootDir = locateFixtures('basic')
  const encryptedRootDir = path.join(path.dirname(sourceRootDir), 'src_encrypted')
  const pathResolver = new FileCipherPathResolver({
    plainRootDir: sourceRootDir,
    cryptRootDir: encryptedRootDir,
  })

  test('normalizePlainFilepath', () => {
    expect(normalizePlainFilepath('a.txt', pathResolver)).toEqual('a.txt')
    expect(normalizePlainFilepath('a.txt/', pathResolver)).toEqual('a.txt')
    expect(normalizePlainFilepath('./a.txt', pathResolver)).toEqual('a.txt')
    expect(normalizePlainFilepath('./a.txt/', pathResolver)).toEqual('a.txt')
    expect(normalizePlainFilepath('a/b/c//d/e/a.txt', pathResolver)).toEqual('a/b/c/d/e/a.txt')
    expect(() => normalizePlainFilepath('/a.txt', pathResolver)).toThrow(
      /Invariant failed: Not under the plainRootDir:/,
    )
    expect(() => normalizePlainFilepath('../a.txt', pathResolver)).toThrow(
      /Invariant failed: Not under the plainRootDir:/,
    )
    expect(() => normalizePlainFilepath('..', pathResolver)).toThrow(
      /Invariant failed: Not under the plainRootDir:/,
    )
    expect(
      normalizePlainFilepath(pathResolver.calcAbsolutePlainFilepath('a.txt'), pathResolver),
    ).toEqual('a.txt')
  })

  test('isSameFileCipherItemDraft', () => {
    const basicItem: IFileCipherCatalogItemDraft = {
      plainFilepath: 'waw.txt',
      cryptFilepath: calcMac(Buffer.from('waw.txt')).toString('hex'),
      cryptFileParts: [],
      fingerprint: '',
      size: 20,
      keepPlain: false,
    }

    expect(isSameFileCipherItemDraft(basicItem, basicItem)).toEqual(true)
    expect(isSameFileCipherItemDraft(basicItem, { ...basicItem })).toEqual(true)
    expect(
      isSameFileCipherItemDraft(basicItem, { ...basicItem, plainFilepath: 'waw2.txt' }),
    ).toEqual(false)
    expect(
      isSameFileCipherItemDraft(basicItem, { ...basicItem, cryptFilepath: 'waw2.txt' }),
    ).toEqual(false)
    expect(
      isSameFileCipherItemDraft(basicItem, { ...basicItem, cryptFileParts: ['waw2.txt'] }),
    ).toEqual(true)
    expect(
      isSameFileCipherItemDraft(basicItem, {
        ...basicItem,
        cryptFileParts: ['waw2.txt', 'waw3.txt'],
      }),
    ).toEqual(true)
    expect(isSameFileCipherItemDraft(basicItem, { ...basicItem, keepPlain: true })).toEqual(false)
  })

  test('isSameFileCipherItem', () => {
    const basicItem: IFileCipherCatalogItem = {
      plainFilepath: 'waw.txt',
      cryptFilepath: calcMac(Buffer.from('waw.txt')).toString('hex'),
      cryptFileParts: [],
      fingerprint: '',
      size: 20,
      keepPlain: false,
      iv: 'dddef89d89c3fe3ca704d5fd',
      authTag: undefined,
    }

    expect(isSameFileCipherItem(basicItem, basicItem)).toEqual(true)
    expect(isSameFileCipherItem(basicItem, { ...basicItem })).toEqual(true)
    expect(isSameFileCipherItem(basicItem, { ...basicItem, plainFilepath: 'waw2.txt' })).toEqual(
      false,
    )
    expect(isSameFileCipherItem(basicItem, { ...basicItem, cryptFilepath: 'waw2.txt' })).toEqual(
      false,
    )
    expect(isSameFileCipherItem(basicItem, { ...basicItem, cryptFileParts: ['waw2.txt'] })).toEqual(
      true,
    )
    expect(
      isSameFileCipherItem(basicItem, {
        ...basicItem,
        cryptFileParts: ['waw2.txt', 'waw3.txt'],
      }),
    ).toEqual(true)
    expect(isSameFileCipherItem(basicItem, { ...basicItem, keepPlain: true })).toEqual(false)
    expect(
      isSameFileCipherItem(basicItem, { ...basicItem, iv: '00ca7b42b7a371351da9a287' }),
    ).toEqual(false)
  })

  test('collectAffectedPlainFilepaths / collectAffectedCryptFilepaths', () => {
    const diffItems: IFileCipherCatalogItemDiffDraft[] = [
      {
        changeType: FileChangeType.ADDED,
        newItem: itemTable.A,
      },
      {
        changeType: FileChangeType.REMOVED,
        oldItem: itemTable.B,
      },
      {
        changeType: FileChangeType.MODIFIED,
        oldItem: itemTable.C,
        newItem: {
          plainFilepath: 'c.txt',
          cryptFilepath: 'd.txt',
          cryptFileParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
          fingerprint: '40cb73b4c02d34812f38a5ca3a3f95d377285e83d7bb499573b918e1862bcf13',
          size: 3150,
          keepPlain: true,
        },
      },
    ]

    expect(collectAffectedPlainFilepaths(diffItems)).toEqual(['a.txt', 'b.txt', 'c.txt'])
    expect(collectAffectedCryptFilepaths(diffItems)).toEqual([
      'a.txt',
      'encrypted/d52a60a064cc6ae727b065a078231e41756e9b7fd0cedb301789b0406dc48269',
      'encrypted/f608f5814560f4375dda3e7dc8005ca6df2176155828349fd73919e8177bf9a7.ghc-part1',
      'encrypted/f608f5814560f4375dda3e7dc8005ca6df2176155828349fd73919e8177bf9a7.ghc-part2',
      'encrypted/f608f5814560f4375dda3e7dc8005ca6df2176155828349fd73919e8177bf9a7.ghc-part3',
      'encrypted/f608f5814560f4375dda3e7dc8005ca6df2176155828349fd73919e8177bf9a7.ghc-part4',
      'd.txt.ghc-part1',
      'd.txt.ghc-part2',
      'd.txt.ghc-part3',
      'd.txt.ghc-part4',
    ])
  })
})

describe('mac', () => {
  test('calcMacFromFile', async () => {
    const filepaths = ['1.md', '2.md'].map(p => locateFixtures('basic', p))
    const macs = await Promise.all(filepaths.map(p => calcMacFromFile(p)))

    expect(macs.length).toEqual(filepaths.length)
    for (let i = 0; i < macs.length; ++i) {
      for (let j = i + 1; j < macs.length; ++j) {
        expect(macs[i]).not.toEqual(macs[j])
      }
    }

    for (let i = 0; i < 3; ++i) {
      const macs2 = await Promise.all(filepaths.map(p => calcMacFromFile(p)))
      expect(macs2.length).toEqual(macs.length)
      for (let j = 0; j < macs.length; ++j) {
        expect(macs2[j]).toEqual(macs[j])
      }
    }
  })

  test('calcFingerprintFromMac', async () => {
    const filepaths = ['1.md', '2.md'].map(p => locateFixtures('basic', p))
    const macs = await Promise.all(filepaths.map(p => calcMacFromFile(p)))
    const fingerprints = macs.map(mac => calcFingerprintFromMac(mac))

    expect(fingerprints.length).toEqual(filepaths.length)
    for (let i = 0; i < fingerprints.length; ++i) {
      for (let j = i + 1; j < fingerprints.length; ++j) {
        expect(fingerprints[i]).not.toEqual(fingerprints[j])
      }
    }

    for (let i = 0; i < 3; ++i) {
      const macs2 = await Promise.all(filepaths.map(p => calcMacFromFile(p)))
      const fingerprints2 = macs2.map(mac => calcFingerprintFromMac(mac))
      expect(fingerprints2.length).toEqual(fingerprints.length)
      for (let j = 0; j < fingerprints2.length; ++j) {
        expect(fingerprints2[j]).toEqual(fingerprints[j])
      }
    }
  })

  test('calcFingerprintFromString', () => {
    expect(calcFingerprintFromString('hello, world!', 'utf8')).toEqual(
      '68e656b251e67e8358bef8483ab0d51c6619f3e7a1a9f0e75838d41ff368f728',
    )
  })

  test('calcFingerprintFromFile', async () => {
    const filepaths = ['1.md', '2.md'].map(p => locateFixtures('basic', p))
    const fingerprints = await Promise.all(filepaths.map(p => calcFingerprintFromFile(p)))

    expect(fingerprints.length).toEqual(filepaths.length)
    for (let i = 0; i < fingerprints.length; ++i) {
      for (let j = i + 1; j < fingerprints.length; ++j) {
        expect(fingerprints[i]).not.toEqual(fingerprints[j])
      }
    }

    for (let i = 0; i < 3; ++i) {
      const macs2 = await Promise.all(filepaths.map(p => calcMacFromFile(p)))
      const fingerprints2 = macs2.map(mac => calcFingerprintFromMac(mac))
      expect(fingerprints2.length).toEqual(fingerprints.length)
      for (let j = 0; j < fingerprints2.length; ++j) {
        expect(fingerprints2[j]).toEqual(fingerprints[j])
      }
    }
  })
})
