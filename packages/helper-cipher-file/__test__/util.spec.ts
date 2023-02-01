import { locateFixtures } from 'jest.helper'
import crypto from 'node:crypto'
import path from 'node:path'
import type { IFileCipherCatalogItem, IFileCipherCatalogItemDiff } from '../src'
import {
  FileChangeType,
  FileCipherPathResolver,
  calcFingerprintFromFile,
  calcFingerprintFromMac,
  calcFingerprintFromString,
  calcMac,
  calcMacFromFile,
  calcMacFromString,
  collectAffectedCryptFilepaths,
  collectAffectedPlainFilepaths,
  isSameFileCipherItem,
  normalizePlainFilepath,
} from '../src'

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

  test('isSameFileCipherItem', () => {
    const basicItem: IFileCipherCatalogItem = {
      plainFilepath: 'waw.txt',
      cryptFilepath: calcMac(Buffer.from('waw.txt')).toString('hex'),
      cryptFileParts: [],
      fingerprint: '',
      size: 20,
      keepPlain: false,
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
    expect(isSameFileCipherItem(basicItem, { ...basicItem, keepPlain: true })).toEqual(false)
  })

  test('collectAffectedPlainFilepaths / collectAffectedCryptFilepaths', () => {
    const diffItems: IFileCipherCatalogItemDiff[] = [
      {
        changeType: FileChangeType.ADDED,
        newItem: {
          plainFilepath: 'a.txt',
          cryptFilepath: 'a.txt',
          cryptFileParts: [],
          fingerprint: '4e26698e6bebd87fc210bec49fea4da6210b5769dbff50b3479effa16799120f',
          size: 9,
          keepPlain: true,
        },
      },
      {
        changeType: FileChangeType.REMOVED,
        oldItem: {
          plainFilepath: 'b.txt',
          cryptFilepath:
            'encrypted/ffa0da5d885fba09d903c782713b6b098c8cf21f56a3a35d9aa920613220d2e1',
          cryptFileParts: [],
          fingerprint: '6fee185efd0ffc7c51f986dcd2eb513e0ce0b63249d9a3bb51efe0c1ed2cb615',
          size: 135,
          keepPlain: false,
        },
      },
      {
        changeType: FileChangeType.MODIFIED,
        oldItem: {
          plainFilepath: 'c.txt',
          cryptFilepath:
            'encrypted/4fe006196474bf40b078b5e230ccf558f791129837884cbc74daf74ef1164420',
          cryptFileParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
          fingerprint: 'b835f16cc543838431fa5bbeceb8906c667c16af9f98779f54541aeae0ccdce2',
          size: 3150,
          keepPlain: false,
        },
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
      'encrypted/ffa0da5d885fba09d903c782713b6b098c8cf21f56a3a35d9aa920613220d2e1',
      'encrypted/4fe006196474bf40b078b5e230ccf558f791129837884cbc74daf74ef1164420.ghc-part1',
      'encrypted/4fe006196474bf40b078b5e230ccf558f791129837884cbc74daf74ef1164420.ghc-part2',
      'encrypted/4fe006196474bf40b078b5e230ccf558f791129837884cbc74daf74ef1164420.ghc-part3',
      'encrypted/4fe006196474bf40b078b5e230ccf558f791129837884cbc74daf74ef1164420.ghc-part4',
      'd.txt.ghc-part1',
      'd.txt.ghc-part2',
      'd.txt.ghc-part3',
      'd.txt.ghc-part4',
    ])
  })
})

describe('mac', () => {
  test('calcMac', () => {
    const size = 32
    const contents: Buffer[] = Array.from(Array(size)).map(() =>
      crypto.randomBytes(Math.random() * 48 + 16),
    )

    const mac1 = calcMac(...contents)
    for (let i = 0; i < 10; ++i) {
      const mac2 = calcMac(...contents)
      expect(mac1.toString()).toEqual(mac2.toString())
    }
  })

  test('calcMacFromString', () => {
    expect(calcMacFromString('hello, world!', 'utf8').toString('hex')).toEqual(
      '68e656b251e67e8358bef8483ab0d51c6619f3e7a1a9f0e75838d41ff368f728',
    )
  })

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
