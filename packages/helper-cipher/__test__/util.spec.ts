import { locateFixtures } from 'jest.helper'
import path from 'node:path'
import type { IFileCipherCatalogItem } from '../src'
import {
  FileChangeType,
  FileCipherPathResolver,
  calcFingerprintFromFile,
  calcFingerprintFromMac,
  calcFingerprintFromString,
  calcMac,
  calcMacFromFile,
  calcMacFromString,
  createRandomIv,
  createRandomKey,
  diffFileCipherItems,
  isSameFileCipherItem,
} from '../src'
import { calcFileCipherCatalogItem, normalizeSourceFilepath } from '../src/util/catalog'

describe('catalog', () => {
  const sourceRootDir = locateFixtures('basic')
  const encryptedRootDir = path.join(path.dirname(sourceRootDir), 'src_encrypted')
  const pathResolver = new FileCipherPathResolver({ sourceRootDir, encryptedRootDir })

  test('normalizeSourceFilepath', () => {
    expect(normalizeSourceFilepath('a.txt', pathResolver)).toEqual('a.txt')
    expect(normalizeSourceFilepath('a.txt/', pathResolver)).toEqual('a.txt')
    expect(normalizeSourceFilepath('./a.txt', pathResolver)).toEqual('a.txt')
    expect(normalizeSourceFilepath('./a.txt/', pathResolver)).toEqual('a.txt')
    expect(normalizeSourceFilepath('a/b/c//d/e/a.txt', pathResolver)).toEqual('a/b/c/d/e/a.txt')
    expect(() => normalizeSourceFilepath('/a.txt', pathResolver)).toThrow(
      /Invariant failed: Not under the sourceRootDir:/,
    )
    expect(() => normalizeSourceFilepath('../a.txt', pathResolver)).toThrow(
      /Invariant failed: Not under the sourceRootDir:/,
    )
    expect(() => normalizeSourceFilepath('..', pathResolver)).toThrow(
      /Invariant failed: Not under the sourceRootDir:/,
    )
    expect(
      normalizeSourceFilepath(pathResolver.calcAbsoluteSourceFilepath('a.txt'), pathResolver),
    ).toEqual('a.txt')
  })

  test('calcFileCipherCatalogItem', async () => {
    expect(
      await calcFileCipherCatalogItem('1.md', {
        keepPlain: true,
        maxTargetSize: 1024,
        partCodePrefix: '.ghc',
        pathResolver,
      }),
    ).toEqual({
      sourceFilepath: '1.md',
      encryptedFilepath: 'b00148fa04d6199d170c98f34e3d86960f8ce24b',
      encryptedFileParts: [],
      fingerprint: '01ec0cc89186ab8a608814a9a124f4fdb0494ef4',
      keepPlain: true,
      size: 452,
    })

    expect(
      await calcFileCipherCatalogItem('big-file.md', {
        keepPlain: false,
        maxTargetSize: 1024,
        partCodePrefix: '.ghc-',
        pathResolver,
      }),
    ).toEqual({
      sourceFilepath: 'big-file.md',
      encryptedFilepath: 'e401fe5a45a2fe62f211898bdf026d730a7fa076',
      encryptedFileParts: ['.ghc-1', '.ghc-2', '.ghc-3', '.ghc-4', '.ghc-5', '.ghc-6'],
      fingerprint: '69ec6ca7b731c639569a7574f2fe4f39da43c9d9',
      keepPlain: false,
      size: 5258,
    })
  })
})

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

  test('diffFileCipherItems', () => {
    const oldItems = [
      {
        sourceFilepath: '1.md',
        encryptedFilepath: 'b00148fa04d6199d170c98f34e3d86960f8ce24b',
        encryptedFileParts: [],
        fingerprint: '01ec0cc89186ab8a608814a9a124f4fdb0494ef4',
        keepPlain: true,
        size: 452,
      },
      {
        sourceFilepath: '2.md',
        encryptedFilepath: 'b00148fa04d6199d170c98f34e3d86960f8ce24t',
        encryptedFileParts: [],
        fingerprint: '01ec0cc89186ab8a608814a9a124f4fdb0494ef4',
        keepPlain: true,
        size: 452,
      },
      {
        sourceFilepath: '3.md',
        encryptedFilepath: 'b00148fa04d6199d170c98f34e3d86960f8ce24o',
        encryptedFileParts: [],
        fingerprint: '01ec0cc89186ab8a608814a9a124f4fdb0494ef4',
        keepPlain: true,
        size: 452,
      },
    ]

    const newItems = [
      {
        sourceFilepath: '2.md',
        encryptedFilepath: 'b00148fa04d6199d170c98f34e3d86960f8ce24t',
        encryptedFileParts: [''],
        fingerprint: '01ec0cc89186ab8a608814a9a124f4fdb0494ef4',
        keepPlain: true,
        size: 452,
      },
      {
        sourceFilepath: '3.md',
        encryptedFilepath: 'b00148fa04d6199d170c98f34e3d86960f8ce24o',
        encryptedFileParts: [],
        fingerprint: '01ec9cc89186ab8a608814a9a124f4fdb0494ef4',
        keepPlain: true,
        size: 931,
      },
      {
        sourceFilepath: '4.md',
        encryptedFilepath: 'b00148fa04d6199d170c98f34e3d86960f8ce24q',
        encryptedFileParts: [],
        fingerprint: '01ec9cc89186ab8a608814a9a124f4fdb0494e94',
        keepPlain: true,
        size: 1031,
      },
      {
        sourceFilepath: '5.md',
        encryptedFilepath: 'b00148fa04d6199d170c98f34e3d86960f8ce24x',
        encryptedFileParts: [],
        fingerprint: '01ec9cc89186ab8a608814a9a124f4fdb0494e94',
        keepPlain: true,
        size: 931,
      },
    ]

    expect(diffFileCipherItems(oldItems, [])).toEqual(
      oldItems.map(item => ({ changeType: FileChangeType.REMOVED, oldItem: item })),
    )
    expect(diffFileCipherItems([], newItems)).toEqual(
      newItems.map(item => ({ changeType: FileChangeType.ADDED, newItem: item })),
    )
    expect(diffFileCipherItems(oldItems, newItems)).toEqual([
      {
        changeType: 'removed',
        oldItem: {
          sourceFilepath: '1.md',
          encryptedFilepath: 'b00148fa04d6199d170c98f34e3d86960f8ce24b',
          encryptedFileParts: [],
          fingerprint: '01ec0cc89186ab8a608814a9a124f4fdb0494ef4',
          keepPlain: true,
          size: 452,
        },
      },
      {
        changeType: 'added',
        newItem: {
          sourceFilepath: '4.md',
          encryptedFilepath: 'b00148fa04d6199d170c98f34e3d86960f8ce24q',
          encryptedFileParts: [],
          fingerprint: '01ec9cc89186ab8a608814a9a124f4fdb0494e94',
          keepPlain: true,
          size: 1031,
        },
      },
      {
        changeType: 'added',
        newItem: {
          sourceFilepath: '5.md',
          encryptedFilepath: 'b00148fa04d6199d170c98f34e3d86960f8ce24x',
          encryptedFileParts: [],
          fingerprint: '01ec9cc89186ab8a608814a9a124f4fdb0494e94',
          keepPlain: true,
          size: 931,
        },
      },
      {
        changeType: 'modified',
        newItem: {
          sourceFilepath: '3.md',
          encryptedFilepath: 'b00148fa04d6199d170c98f34e3d86960f8ce24o',
          encryptedFileParts: [],
          fingerprint: '01ec9cc89186ab8a608814a9a124f4fdb0494ef4',
          keepPlain: true,
          size: 931,
        },
        oldItem: {
          sourceFilepath: '3.md',
          encryptedFilepath: 'b00148fa04d6199d170c98f34e3d86960f8ce24o',
          encryptedFileParts: [],
          fingerprint: '01ec0cc89186ab8a608814a9a124f4fdb0494ef4',
          keepPlain: true,
          size: 452,
        },
      },
    ])
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
