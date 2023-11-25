import { bytes2text, text2bytes } from '@guanghechen/byte'
import type {
  ICatalogItem,
  IDraftCatalogDiffItem,
  IDraftCatalogItem,
} from '@guanghechen/cipher-workspace.types'
import { FileChangeType } from '@guanghechen/cipher-workspace.types'
import { calcMac, calcMacFromFile } from '@guanghechen/mac'
import { WorkspacePathResolver, pathResolver } from '@guanghechen/path'
import { locateFixtures } from 'jest.helper'
import {
  calcFingerprintFromFile,
  calcFingerprintFromMac,
  calcFingerprintFromString,
  collectAffectedCryptFilepaths,
  collectAffectedPlainFilepaths,
  isSameFileCipherItem,
  isSameFileCipherItemDraft,
  normalizePlainFilepath,
} from '../src'
import { contentHashAlgorithm, itemTable, pathHashAlgorithm } from './_data'

describe('catalog', () => {
  const plainRootDir = locateFixtures('basic')
  const plainPathResolver = new WorkspacePathResolver(plainRootDir, pathResolver)

  test('normalizePlainFilepath', () => {
    expect(normalizePlainFilepath('a.txt', plainPathResolver)).toEqual('a.txt')
    expect(normalizePlainFilepath('a.txt/', plainPathResolver)).toEqual('a.txt')
    expect(normalizePlainFilepath('./a.txt', plainPathResolver)).toEqual('a.txt')
    expect(normalizePlainFilepath('./a.txt/', plainPathResolver)).toEqual('a.txt')
    expect(normalizePlainFilepath('a/b/c//d/e/a.txt', plainPathResolver)).toEqual('a/b/c/d/e/a.txt')
    expect(() => normalizePlainFilepath('/a.txt', plainPathResolver)).toThrow('not under the root')
    expect(() => normalizePlainFilepath('../a.txt', plainPathResolver)).toThrow(
      'not under the root',
    )
    expect(() => normalizePlainFilepath('..', plainPathResolver)).toThrow('not under the root')
    expect(normalizePlainFilepath(plainPathResolver.resolve('a.txt'), plainPathResolver)).toEqual(
      'a.txt',
    )
  })

  test('isSameFileCipherItemDraft', () => {
    const basicItem: IDraftCatalogItem = {
      plainFilepath: 'waw.txt',
      cryptFilepath: bytes2text(calcMac([text2bytes('waw.txt', 'utf8')], pathHashAlgorithm), 'hex'),
      cryptFilepathParts: [],
      fingerprint: '',
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
      isSameFileCipherItemDraft(basicItem, { ...basicItem, cryptFilepathParts: ['waw2.txt'] }),
    ).toEqual(false)
    expect(
      isSameFileCipherItemDraft(basicItem, {
        ...basicItem,
        cryptFilepathParts: ['waw2.txt', 'waw3.txt'],
      }),
    ).toEqual(false)
    expect(isSameFileCipherItemDraft(basicItem, { ...basicItem, keepPlain: true })).toEqual(false)
  })

  test('isSameFileCipherItem', () => {
    const basicItem: ICatalogItem = {
      plainFilepath: 'waw.txt',
      cryptFilepath: bytes2text(calcMac([text2bytes('waw.txt', 'utf8')], pathHashAlgorithm), 'hex'),
      cryptFilepathParts: [],
      fingerprint: '',
      keepPlain: false,
      iv: text2bytes('dddef89d89c3fe3ca704d5fd', 'hex'),
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
    expect(
      isSameFileCipherItem(basicItem, { ...basicItem, cryptFilepathParts: ['waw2.txt'] }),
    ).toEqual(false)
    expect(
      isSameFileCipherItem(basicItem, {
        ...basicItem,
        cryptFilepathParts: ['waw2.txt', 'waw3.txt'],
      }),
    ).toEqual(false)
    expect(isSameFileCipherItem(basicItem, { ...basicItem, keepPlain: true })).toEqual(false)
    expect(
      isSameFileCipherItem(basicItem, {
        ...basicItem,
        iv: text2bytes('00ca7b42b7a371351da9a287', 'hex'),
      }),
    ).toEqual(false)
  })

  test('collectAffectedPlainFilepaths / collectAffectedCryptFilepaths', () => {
    const diffItems: IDraftCatalogDiffItem[] = [
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
          cryptFilepathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
          fingerprint: '40cb73b4c02d34812f38a5ca3a3f95d377285e83d7bb499573b918e1862bcf13',
          keepPlain: true,
        },
      },
    ]

    expect(collectAffectedPlainFilepaths(diffItems)).toEqual(['a.txt', 'b.txt', 'c.txt'])
    expect(collectAffectedCryptFilepaths(diffItems)).toEqual([
      'a.txt',
      'kirito/d52a60a064cc6ae727b065a078231e41756e9b7fd0cedb301789b0406dc48269',
      'kirito/f608f5814560f4375dda3e7dc8005ca6df2176155828349fd73919e8177bf9a7.ghc-part1',
      'kirito/f608f5814560f4375dda3e7dc8005ca6df2176155828349fd73919e8177bf9a7.ghc-part2',
      'kirito/f608f5814560f4375dda3e7dc8005ca6df2176155828349fd73919e8177bf9a7.ghc-part3',
      'kirito/f608f5814560f4375dda3e7dc8005ca6df2176155828349fd73919e8177bf9a7.ghc-part4',
      'd.txt.ghc-part1',
      'd.txt.ghc-part2',
      'd.txt.ghc-part3',
      'd.txt.ghc-part4',
    ])
  })
})

describe('mac', () => {
  test('calcFingerprintFromMac', async () => {
    const filepaths = ['1.md', '2.md'].map(p => locateFixtures('basic', p))
    const macs = await Promise.all(filepaths.map(p => calcMacFromFile(p, contentHashAlgorithm)))
    const fingerprints = macs.map(mac => calcFingerprintFromMac(mac))

    expect(fingerprints.length).toEqual(filepaths.length)
    for (let i = 0; i < fingerprints.length; ++i) {
      for (let j = i + 1; j < fingerprints.length; ++j) {
        expect(fingerprints[i]).not.toEqual(fingerprints[j])
      }
    }

    for (let i = 0; i < 3; ++i) {
      const macs2 = await Promise.all(filepaths.map(p => calcMacFromFile(p, contentHashAlgorithm)))
      const fingerprints2 = macs2.map(mac => calcFingerprintFromMac(mac))
      expect(fingerprints2.length).toEqual(fingerprints.length)
      for (let j = 0; j < fingerprints2.length; ++j) {
        expect(fingerprints2[j]).toEqual(fingerprints[j])
      }
    }
  })

  test('calcFingerprintFromString', () => {
    expect(calcFingerprintFromString('hello, world!', 'utf8', 'sha256')).toEqual(
      '68e656b251e67e8358bef8483ab0d51c6619f3e7a1a9f0e75838d41ff368f728',
    )
  })

  test('calcFingerprintFromFile', async () => {
    const filepaths = ['1.md', '2.md'].map(p => locateFixtures('basic', p))
    const fingerprints = await Promise.all(filepaths.map(p => calcFingerprintFromFile(p, 'sha256')))

    expect(fingerprints.length).toEqual(filepaths.length)
    for (let i = 0; i < fingerprints.length; ++i) {
      for (let j = i + 1; j < fingerprints.length; ++j) {
        expect(fingerprints[i]).not.toEqual(fingerprints[j])
      }
    }

    for (let i = 0; i < 3; ++i) {
      const macs2 = await Promise.all(filepaths.map(p => calcMacFromFile(p, 'sha256')))
      const fingerprints2 = macs2.map(mac => calcFingerprintFromMac(mac))
      expect(fingerprints2.length).toEqual(fingerprints.length)
      for (let j = 0; j < fingerprints2.length; ++j) {
        expect(fingerprints2[j]).toEqual(fingerprints[j])
      }
    }
  })
})
