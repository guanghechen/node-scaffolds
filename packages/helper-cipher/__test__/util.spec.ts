import { locateFixtures } from 'jest.helper'
import type { IFileCipherCatalogItem } from '../src'
import {
  calcFingerprintFromFile,
  calcFingerprintFromMac,
  calcFingerprintFromString,
  calcMac,
  calcMacFromFile,
  calcMacFromString,
  createRandomIv,
  createRandomKey,
  isSameFileCipherItem,
} from '../src'

describe('diff', () => {
  test('isSameFileCipherItem', () => {
    const basicItem: IFileCipherCatalogItem = {
      sourceFilepath: 'waw.txt',
      encryptedFilepath: calcMac(Buffer.from('waw.txt')).toString('hex'),
      encryptedFileParts: [],
      fingerprint: '',
      size: 20,
      keepPlain: false,
    }

    expect(isSameFileCipherItem(basicItem, basicItem)).toEqual(true)
    expect(isSameFileCipherItem(basicItem, { ...basicItem })).toEqual(true)
    expect(isSameFileCipherItem(basicItem, { ...basicItem, sourceFilepath: 'waw2.txt' })).toEqual(
      false,
    )
    expect(
      isSameFileCipherItem(basicItem, { ...basicItem, encryptedFilepath: 'waw2.txt' }),
    ).toEqual(false)
    expect(
      isSameFileCipherItem(basicItem, { ...basicItem, encryptedFileParts: ['waw2.txt'] }),
    ).toEqual(true)
    expect(
      isSameFileCipherItem(basicItem, {
        ...basicItem,
        encryptedFileParts: ['waw2.txt', 'waw3.txt'],
      }),
    ).toEqual(true)
    expect(isSameFileCipherItem(basicItem, { ...basicItem, keepPlain: true })).toEqual(false)
    expect(isSameFileCipherItem(basicItem, { ...basicItem, keepPlain: true })).toEqual(false)
  })
})

describe('key', () => {
  test('createRandomIv', () => {
    const size = 32
    const buffers = Array.from(Array(size)).map(() => createRandomIv())
    for (let i = 0; i < size; ++i) {
      const buffer1 = buffers[i]
      for (let j = i + 1; j < size; ++j) {
        const buffer2 = buffers[j]
        expect(buffer1.toString()).not.toEqual(buffer2.toString())
      }
    }
  })

  test('createRandomKey', () => {
    const size = 32
    const buffers = Array.from(Array(size)).map(() => createRandomKey())
    for (let i = 0; i < size; ++i) {
      const buffer1 = buffers[i]
      for (let j = i + 1; j < size; ++j) {
        const buffer2 = buffers[j]
        expect(buffer1.toString()).not.toEqual(buffer2.toString())
      }
    }
  })
})

describe('mac', () => {
  test('calcMac', () => {
    const size = 32
    const contents: Buffer[] = Array.from(Array(size)).map(() =>
      createRandomIv(Math.random() * 48 + 16),
    )

    const mac1 = calcMac(...contents)
    for (let i = 0; i < 10; ++i) {
      const mac2 = calcMac(...contents)
      expect(mac1.toString()).toEqual(mac2.toString())
    }
  })

  test('calcMacFromString', () => {
    expect(calcMacFromString('hello, world!', 'utf8').toString('hex')).toEqual(
      '1f09d30c707d53f3d16c530dd73d70a6ce7596a9',
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
      '1f09d30c707d53f3d16c530dd73d70a6ce7596a9',
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
