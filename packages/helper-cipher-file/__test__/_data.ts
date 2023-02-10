import type {
  IFileCipherCatalogItem,
  IFileCipherCatalogItemDiff,
  IFileCipherCatalogItemDraft,
} from '../src'
import { FileChangeType } from '../src'

type ISymbol = 'A' | 'A2' | 'B' | 'C' | 'D'

export const itemDraftTable: Record<ISymbol, IFileCipherCatalogItemDraft> = {
  A: {
    plainFilepath: 'a.txt',
    cryptFilepath: 'a.txt',
    cryptFileParts: [],
    fingerprint: '4e26698e6bebd87fc210bec49fea4da6210b5769dbff50b3479effa16799120f',
    size: 9,
    keepPlain: true,
  },
  A2: {
    plainFilepath: 'a.txt',
    cryptFilepath: 'encrypted/16f8e82b0acef7d4f1f70fb748bc30621aeb1c8de2504ff8abafc58e1f0d5d60',
    cryptFileParts: [],
    fingerprint: '70b47f9cc28ad379043b328d7d058097c69e7bb38d766ecca2655cd3afb6b5fa',
    size: 30,
    keepPlain: false,
  },
  B: {
    plainFilepath: 'b.txt',
    cryptFilepath: 'encrypted/d52a60a064cc6ae727b065a078231e41756e9b7fd0cedb301789b0406dc48269',
    cryptFileParts: [],
    fingerprint: '6fee185efd0ffc7c51f986dcd2eb513e0ce0b63249d9a3bb51efe0c1ed2cb615',
    size: 135,
    keepPlain: false,
  },
  C: {
    plainFilepath: 'c.txt',
    cryptFilepath: 'encrypted/f608f5814560f4375dda3e7dc8005ca6df2176155828349fd73919e8177bf9a7',
    cryptFileParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
    fingerprint: 'b835f16cc543838431fa5bbeceb8906c667c16af9f98779f54541aeae0ccdce2',
    size: 3150,
    keepPlain: false,
  },
  D: {
    plainFilepath: 'd.txt',
    cryptFilepath: 'd.txt',
    cryptFileParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
    fingerprint: '40cb73b4c02d34812f38a5ca3a3f95d377285e83d7bb499573b918e1862bcf13',
    size: 3150,
    keepPlain: true,
  },
}

export const itemTable: Record<ISymbol, IFileCipherCatalogItem> = {
  A: {
    ...itemDraftTable.A,
    iv: '',
    authTag: undefined,
  },
  A2: {
    ...itemDraftTable.A2,
    iv: 'fb2b66c9a126b9c0b1cf24fe',
    authTag: '847dd96fac8018017d1a1d8bc86a4e4d',
  },
  B: {
    ...itemDraftTable.B,
    iv: '9f8a20cc7677722161d59714',
    authTag: '5519968a852057854b7fea723e301fd6',
  },
  C: {
    ...itemDraftTable.C,
    iv: '3933c49f3c2cbc8bd6dd3295',
    authTag: 'dd468a718f2aba0797b8c941159b292e',
  },
  D: {
    ...itemDraftTable.D,
    iv: '',
    authTag: undefined,
  },
}

export const diffItemsTable: Record<string, IFileCipherCatalogItemDiff[]> = {
  step1: [
    {
      changeType: FileChangeType.ADDED,
      newItem: itemTable.A,
    },
    {
      changeType: FileChangeType.ADDED,
      newItem: itemTable.B,
    },
  ],
  step2: [
    {
      changeType: FileChangeType.REMOVED,
      oldItem: itemTable.A,
    },
    {
      changeType: FileChangeType.ADDED,
      newItem: itemTable.C,
    },
  ],
  step3: [
    {
      changeType: FileChangeType.REMOVED,
      oldItem: itemTable.B,
    },
    {
      changeType: FileChangeType.ADDED,
      newItem: itemTable.A,
    },
  ],
  step4: [
    {
      changeType: FileChangeType.REMOVED,
      oldItem: itemTable.C,
    },
    {
      changeType: FileChangeType.ADDED,
      newItem: itemTable.D,
    },
    {
      changeType: FileChangeType.MODIFIED,
      oldItem: itemTable.A,
      newItem: itemTable.A2,
    },
  ],
  step5: [
    {
      changeType: FileChangeType.REMOVED,
      oldItem: itemTable.D,
    },
    {
      changeType: FileChangeType.REMOVED,
      oldItem: itemTable.A2,
    },
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
export const encryptedFilesDir = 'encrypted'
export const maxTargetFileSize = 1024
export const partCodePrefix = '.ghc-part'
