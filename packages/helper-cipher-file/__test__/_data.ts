import type { IFileCipherCatalogItem, IFileCipherCatalogItemDiff } from '../src'
import { FileChangeType } from '../src'

type ISymbol = 'A' | 'A2' | 'B' | 'C' | 'D'

export const itemTable: Record<ISymbol, IFileCipherCatalogItem> = {
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
    cryptFilepath: 'encrypted/18b7cb099a9ea3f50ba899b5ba81e0d377a5f3b16f8f6eeb8b3e58cd4692b993',
    cryptFileParts: [],
    fingerprint: '70b47f9cc28ad379043b328d7d058097c69e7bb38d766ecca2655cd3afb6b5fa',
    size: 30,
    keepPlain: false,
  },
  B: {
    plainFilepath: 'b.txt',
    cryptFilepath: 'encrypted/ffa0da5d885fba09d903c782713b6b098c8cf21f56a3a35d9aa920613220d2e1',
    cryptFileParts: [],
    fingerprint: '6fee185efd0ffc7c51f986dcd2eb513e0ce0b63249d9a3bb51efe0c1ed2cb615',
    size: 135,
    keepPlain: false,
  },
  C: {
    plainFilepath: 'c.txt',
    cryptFilepath: 'encrypted/4fe006196474bf40b078b5e230ccf558f791129837884cbc74daf74ef1164420',
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
export const encryptedDir = 'encrypted'
export const maxTargetFileSize = 1024
export const partCodePrefix = '.ghc-part'
