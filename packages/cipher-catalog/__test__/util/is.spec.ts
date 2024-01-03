import { bytes2text, text2bytes } from '@guanghechen/byte'
import type { ICatalogItem, IDraftCatalogItem } from '@guanghechen/cipher-catalog.types'
import { calcMac } from '@guanghechen/mac'
import { areSameCatalogItem, areSameDraftCatalogItem } from '../../src'
import { PATH_HASH_ALGORITHM } from '../_data'

test('areSameDraftCatalogItem', () => {
  const basicItem: IDraftCatalogItem = {
    plainPath: 'waw.txt',
    cryptPath: bytes2text(calcMac([text2bytes('waw.txt', 'utf8')], PATH_HASH_ALGORITHM), 'hex'),
    cryptPathParts: [''],
    fingerprint: '',
    keepIntegrity: false,
    keepPlain: false,
    nonce: text2bytes('27881449fb89e366810f0e2a9fe5e563', 'hex'),
    ctime: 0,
    mtime: 0,
    size: 60,
  }

  expect(areSameDraftCatalogItem(basicItem, basicItem)).toEqual(true)
  expect(areSameDraftCatalogItem(basicItem, { ...basicItem })).toEqual(true)
  expect(areSameDraftCatalogItem(basicItem, { ...basicItem, plainPath: 'waw2.txt' })).toEqual(false)
  expect(areSameDraftCatalogItem(basicItem, { ...basicItem, cryptPath: 'waw2.txt' })).toEqual(false)
  expect(
    areSameDraftCatalogItem(basicItem, { ...basicItem, cryptPathParts: ['waw2.txt'] }),
  ).toEqual(false)
  expect(
    areSameDraftCatalogItem(basicItem, {
      ...basicItem,
      cryptPathParts: ['waw2.txt', 'waw3.txt'],
    }),
  ).toEqual(false)
  expect(areSameDraftCatalogItem(basicItem, { ...basicItem, keepPlain: true })).toEqual(false)
})

test('areSameCatalogItem', () => {
  const basicItem: ICatalogItem = {
    plainPath: 'waw.txt',
    cryptPath: bytes2text(calcMac([text2bytes('waw.txt', 'utf8')], PATH_HASH_ALGORITHM), 'hex'),
    cryptPathParts: [''],
    fingerprint: '',
    keepIntegrity: false,
    keepPlain: false,
    nonce: text2bytes('fee71b20bbc57e31b12202f282dacdc8', 'hex'),
    authTag: undefined,
    ctime: 0,
    mtime: 0,
    size: 60,
  }

  expect(areSameCatalogItem(basicItem, basicItem)).toEqual(true)
  expect(areSameCatalogItem(basicItem, { ...basicItem })).toEqual(true)
  expect(areSameCatalogItem(basicItem, { ...basicItem, plainPath: 'waw2.txt' })).toEqual(false)
  expect(areSameCatalogItem(basicItem, { ...basicItem, cryptPath: 'waw2.txt' })).toEqual(false)
  expect(areSameCatalogItem(basicItem, { ...basicItem, cryptPathParts: ['waw2.txt'] })).toEqual(
    false,
  )
  expect(
    areSameCatalogItem(basicItem, { ...basicItem, cryptPathParts: ['waw2.txt', 'waw3.txt'] }),
  ).toEqual(false)
  expect(areSameCatalogItem(basicItem, { ...basicItem, keepPlain: true })).toEqual(false)
  expect(
    areSameCatalogItem(basicItem, {
      ...basicItem,
      nonce: text2bytes('052b09285bc546604c8d66a19eccc40f', 'hex'),
    }),
  ).toEqual(false)
})
