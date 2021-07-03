import { locateFixtures } from 'jest.setup'
import {
  calcFingerprint,
  calcMac,
  calcMacFromFile,
  createRandomIv,
  createRandomKey,
} from '../src'

describe('createRandomIv', function () {
  test('basic', function () {
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
})

describe('createRandomKey', function () {
  test('basic', function () {
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

describe('calcMac', function () {
  test('basic', function () {
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
})

describe('calcMacFromFile', function () {
  test('basic', async function () {
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
})

describe('calcFingerprint', function () {
  test('basic', async function () {
    const filepaths = ['1.md', '2.md'].map(p => locateFixtures('basic', p))
    const macs = await Promise.all(filepaths.map(p => calcMacFromFile(p)))
    const fingerprints = macs.map(mac => calcFingerprint(mac))

    expect(fingerprints.length).toEqual(filepaths.length)
    for (let i = 0; i < fingerprints.length; ++i) {
      for (let j = i + 1; j < fingerprints.length; ++j) {
        expect(fingerprints[i]).not.toEqual(fingerprints[j])
      }
    }

    for (let i = 0; i < 3; ++i) {
      const macs2 = await Promise.all(filepaths.map(p => calcMacFromFile(p)))
      const fingerprints2 = macs2.map(mac => calcFingerprint(mac))
      expect(fingerprints2.length).toEqual(fingerprints.length)
      for (let j = 0; j < fingerprints2.length; ++j) {
        expect(fingerprints2[j]).toEqual(fingerprints[j])
      }
    }
  })
})
