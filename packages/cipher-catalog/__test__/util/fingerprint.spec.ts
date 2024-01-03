import { calcMacFromFile } from '@guanghechen/mac'
import { locateFixtures } from 'jest.helper'
import {
  calcFingerprintFromFile,
  calcFingerprintFromMac,
  calcFingerprintFromString,
} from '../../src'
import { CONTENT_HASH_ALGORITHM } from '../_data'

test('calcFingerprintFromMac', async () => {
  const filepaths = ['1.md', '2.md'].map(p => locateFixtures('basic', p))
  const macs = await Promise.all(filepaths.map(p => calcMacFromFile(p, CONTENT_HASH_ALGORITHM)))
  const fingerprints = macs.map(mac => calcFingerprintFromMac(mac))

  expect(fingerprints.length).toEqual(filepaths.length)
  for (let i = 0; i < fingerprints.length; ++i) {
    for (let j = i + 1; j < fingerprints.length; ++j) {
      expect(fingerprints[i]).not.toEqual(fingerprints[j])
    }
  }

  for (let i = 0; i < 3; ++i) {
    const macs2 = await Promise.all(filepaths.map(p => calcMacFromFile(p, CONTENT_HASH_ALGORITHM)))
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
