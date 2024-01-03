import { text2bytes } from '@guanghechen/byte'
import type { IDraftCatalogDiffItem } from '@guanghechen/cipher-catalog.types'
import { FileChangeTypeEnum } from '@guanghechen/cipher-catalog.types'
import { collectAffectedCryptPaths, collectAffectedPlainPaths } from '../../src'
import { itemTable } from '../_data'

const diffItems: IDraftCatalogDiffItem[] = [
  {
    changeType: FileChangeTypeEnum.ADDED,
    newItem: itemTable.A,
  },
  {
    changeType: FileChangeTypeEnum.REMOVED,
    oldItem: itemTable.B,
  },
  {
    changeType: FileChangeTypeEnum.MODIFIED,
    oldItem: itemTable.C,
    newItem: {
      plainPath: 'c.txt',
      cryptPath: 'd.txt',
      cryptPathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
      fingerprint: '40cb73b4c02d34812f38a5ca3a3f95d377285e83d7bb499573b918e1862bcf13',
      keepIntegrity: false,
      keepPlain: true,
      nonce: text2bytes('e31b949dbb18f2ed5decf88d7345c241', 'hex'),
      ctime: 0,
      mtime: 0,
      size: 60,
    },
  },
]

test('collectAffectedPlainFilepaths', () => {
  expect(collectAffectedPlainPaths(diffItems)).toEqual(['a.txt', 'b.txt', 'c.txt'])
})

test('collectAffectedCryptFilepaths', () => {
  expect(collectAffectedCryptPaths(diffItems)).toEqual([
    'a.txt',
    'kirito/346444a4bea4020a29c70628ff065310bdf906bafe1bb389603865bd9acbc74a',
    'kirito/b597c635c06dd800a4ba92b66fc57b25695a09525c9cf0641eeb543dc3e15499.ghc-part1',
    'kirito/b597c635c06dd800a4ba92b66fc57b25695a09525c9cf0641eeb543dc3e15499.ghc-part2',
    'kirito/b597c635c06dd800a4ba92b66fc57b25695a09525c9cf0641eeb543dc3e15499.ghc-part3',
    'kirito/b597c635c06dd800a4ba92b66fc57b25695a09525c9cf0641eeb543dc3e15499.ghc-part4',
    'd.txt.ghc-part1',
    'd.txt.ghc-part2',
    'd.txt.ghc-part3',
    'd.txt.ghc-part4',
  ])
})
