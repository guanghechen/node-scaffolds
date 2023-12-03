import { text2bytes } from '@guanghechen/byte'
import { FileChangeType } from '@guanghechen/cipher-catalog.types'
import type {
  ICatalogDiffItem,
  ICatalogItem,
  IDraftCatalogItem,
} from '@guanghechen/cipher-catalog.types'
import type { IHashAlgorithm } from '@guanghechen/mac'

type ISymbol = 'A' | 'A2' | 'B' | 'C' | 'D'

export const itemDraftTable: Record<ISymbol, IDraftCatalogItem> = {
  A: {
    plainFilepath: 'a.txt',
    cryptFilepath: 'a.txt',
    cryptFilepathParts: [],
    fingerprint: '4e26698e6bebd87fc210bec49fea4da6210b5769dbff50b3479effa16799120f',
    keepPlain: true,
  },
  A2: {
    plainFilepath: 'a.txt',
    cryptFilepath: 'a.txt',
    cryptFilepathParts: [],
    fingerprint: '70b47f9cc28ad379043b328d7d058097c69e7bb38d766ecca2655cd3afb6b5fa',
    keepPlain: true,
  },
  B: {
    plainFilepath: 'b.txt',
    cryptFilepath: 'kirito/d52a60a064cc6ae727b065a078231e41756e9b7fd0cedb301789b0406dc48269',
    cryptFilepathParts: [],
    fingerprint: '6fee185efd0ffc7c51f986dcd2eb513e0ce0b63249d9a3bb51efe0c1ed2cb615',
    keepPlain: false,
  },
  C: {
    plainFilepath: 'c.txt',
    cryptFilepath: 'kirito/f608f5814560f4375dda3e7dc8005ca6df2176155828349fd73919e8177bf9a7',
    cryptFilepathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
    fingerprint: 'b835f16cc543838431fa5bbeceb8906c667c16af9f98779f54541aeae0ccdce2',
    keepPlain: false,
  },
  D: {
    plainFilepath: 'd.txt',
    cryptFilepath: 'kirito/3f85a53ebde475b03be7e172d034d9530734639502f2c03e82ee09608af33526',
    cryptFilepathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
    fingerprint: '40cb73b4c02d34812f38a5ca3a3f95d377285e83d7bb499573b918e1862bcf13',
    keepPlain: false,
  },
}

export const itemTable: Record<ISymbol, ICatalogItem> = {
  A: {
    ...itemDraftTable.A,
    iv: undefined,
    authTag: undefined,
  },
  A2: {
    ...itemDraftTable.A2,
    iv: undefined,
    authTag: undefined,
  },
  B: {
    ...itemDraftTable.B,
    iv: text2bytes('9f8a20cc7677722161d59714', 'hex'),
    authTag: text2bytes('5519968a852057854b7fea723e301fd6', 'hex'),
  },
  C: {
    ...itemDraftTable.C,
    iv: text2bytes('3933c49f3c2cbc8bd6dd3295', 'hex'),
    authTag: text2bytes('dd468a718f2aba0797b8c941159b292e', 'hex'),
  },
  D: {
    ...itemDraftTable.D,
    iv: undefined,
    authTag: text2bytes('6d721d17fe9def40a17a05aa532d3648', 'hex'),
  },
}

export const diffItemsTable: Record<string, ICatalogDiffItem[]> = {
  step1: [
    { changeType: FileChangeType.ADDED, newItem: itemTable.A },
    { changeType: FileChangeType.ADDED, newItem: itemTable.B },
  ],
  step2: [
    { changeType: FileChangeType.REMOVED, oldItem: itemTable.A },
    { changeType: FileChangeType.ADDED, newItem: itemTable.C },
  ],
  step3: [
    { changeType: FileChangeType.REMOVED, oldItem: itemTable.B },
    { changeType: FileChangeType.ADDED, newItem: itemTable.A },
  ],
  step4: [
    { changeType: FileChangeType.REMOVED, oldItem: itemTable.C },
    { changeType: FileChangeType.ADDED, newItem: itemTable.D },
    { changeType: FileChangeType.MODIFIED, oldItem: itemTable.A, newItem: itemTable.A2 },
  ],
  step5: [
    { changeType: FileChangeType.REMOVED, oldItem: itemTable.D },
    { changeType: FileChangeType.REMOVED, oldItem: itemTable.A2 },
  ],
}

export const contentTable: Record<ISymbol, string> = {
  A: 'Hello, A.',
  A2: 'Hello, A2.'.repeat(3),
  B: 'Hello, B.'.repeat(15),
  C: 'Hello, C.'.repeat(350),
  D: 'Hello, D.'.repeat(350),
}

export const encoding: BufferEncoding = 'utf8'
export const cryptFilesDir = 'kirito'
export const maxTargetFileSize = 1024
export const partCodePrefix = '.ghc-part'
export const contentHashAlgorithm: IHashAlgorithm = 'sha256'
export const pathHashAlgorithm: IHashAlgorithm = 'sha256'
