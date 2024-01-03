import { text2bytes } from '@guanghechen/byte'
import { FileChangeTypeEnum } from '@guanghechen/cipher-catalog.types'
import type {
  ICatalogDiffItem,
  ICatalogItem,
  IDraftCatalogItem,
} from '@guanghechen/cipher-catalog.types'
import { DEFAULT_FILEPART_CODE_PREFIX } from '@guanghechen/filepart.types'
import type { IHashAlgorithm } from '@guanghechen/mac'

type ISymbol = 'A' | 'A2' | 'B' | 'C' | 'D'

export const itemDraftTable: Record<ISymbol, IDraftCatalogItem> = {
  A: {
    plainPath: 'a.txt',
    cryptPath: 'a.txt',
    cryptPathParts: [''],
    fingerprint: '4e26698e6bebd87fc210bec49fea4da6210b5769dbff50b3479effa16799120f',
    keepIntegrity: false,
    keepPlain: true,
    nonce: text2bytes('af5e87dbe9a86c24d35df07e5151bb76', 'hex'),
    ctime: 0,
    mtime: 0,
    size: 9,
  },
  A2: {
    plainPath: 'a.txt',
    cryptPath: 'a.txt',
    cryptPathParts: [''],
    fingerprint: '70b47f9cc28ad379043b328d7d058097c69e7bb38d766ecca2655cd3afb6b5fa',
    keepIntegrity: false,
    keepPlain: true,
    nonce: text2bytes('af5e87dbe9a86c24d35df07e5151bb76', 'hex'),
    ctime: 0,
    mtime: 0,
    size: 30,
  },
  B: {
    plainPath: 'b.txt',
    cryptPath: 'kirito/346444a4bea4020a29c70628ff065310bdf906bafe1bb389603865bd9acbc74a',
    cryptPathParts: [''],
    fingerprint: '6fee185efd0ffc7c51f986dcd2eb513e0ce0b63249d9a3bb51efe0c1ed2cb615',
    keepIntegrity: false,
    keepPlain: false,
    nonce: text2bytes('af5e87dbe9a86c24d35df07e5151bb76', 'hex'),
    ctime: 0,
    mtime: 0,
    size: 135,
  },
  C: {
    plainPath: 'c.txt',
    cryptPath: 'kirito/b597c635c06dd800a4ba92b66fc57b25695a09525c9cf0641eeb543dc3e15499',
    cryptPathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
    fingerprint: 'b835f16cc543838431fa5bbeceb8906c667c16af9f98779f54541aeae0ccdce2',
    keepIntegrity: false,
    keepPlain: false,
    nonce: text2bytes('af5e87dbe9a86c24d35df07e5151bb76', 'hex'),
    ctime: 0,
    mtime: 0,
    size: 3150,
  },
  D: {
    plainPath: 'd.txt',
    cryptPath: 'kirito/d3d9283fe2e7959eaa7dac934fdc4aceea03b6478cbfe44fdffbd8aa4d7f8875',
    cryptPathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
    fingerprint: '40cb73b4c02d34812f38a5ca3a3f95d377285e83d7bb499573b918e1862bcf13',
    keepIntegrity: false,
    keepPlain: false,
    nonce: text2bytes('af5e87dbe9a86c24d35df07e5151bb76', 'hex'),
    ctime: 0,
    mtime: 0,
    size: 3150,
  },
}

export const itemTable: Record<ISymbol, ICatalogItem> = {
  A: {
    ...itemDraftTable.A,
    authTag: undefined,
  },
  A2: {
    ...itemDraftTable.A2,
    authTag: undefined,
  },
  B: {
    ...itemDraftTable.B,
    authTag: text2bytes('5519968a852057854b7fea723e301fd6', 'hex'),
  },
  C: {
    ...itemDraftTable.C,
    authTag: text2bytes('dd468a718f2aba0797b8c941159b292e', 'hex'),
  },
  D: {
    ...itemDraftTable.D,
    authTag: text2bytes('6d721d17fe9def40a17a05aa532d3648', 'hex'),
  },
}

export const diffItemsTable: Record<string, ICatalogDiffItem[]> = {
  step1: [
    { changeType: FileChangeTypeEnum.ADDED, newItem: itemTable.A },
    { changeType: FileChangeTypeEnum.ADDED, newItem: itemTable.B },
  ],
  step2: [
    { changeType: FileChangeTypeEnum.REMOVED, oldItem: itemTable.A },
    { changeType: FileChangeTypeEnum.ADDED, newItem: itemTable.C },
  ],
  step3: [
    { changeType: FileChangeTypeEnum.REMOVED, oldItem: itemTable.B },
    { changeType: FileChangeTypeEnum.ADDED, newItem: itemTable.A },
  ],
  step4: [
    { changeType: FileChangeTypeEnum.REMOVED, oldItem: itemTable.C },
    { changeType: FileChangeTypeEnum.ADDED, newItem: itemTable.D },
    { changeType: FileChangeTypeEnum.MODIFIED, oldItem: itemTable.A, newItem: itemTable.A2 },
  ],
  step5: [
    { changeType: FileChangeTypeEnum.REMOVED, oldItem: itemTable.D },
    { changeType: FileChangeTypeEnum.REMOVED, oldItem: itemTable.A2 },
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
export const CONTENT_HASH_ALGORITHM: IHashAlgorithm = 'sha256'
export const CRYPT_FILES_DIR = 'kirito'
export const CRYPT_PATH_SALT = 'guanghechen'
export const MAX_CRYPT_FILE_SIZE = 1024
export const NONCE_SIZE = 16
export const PART_CODE_PREFIX = DEFAULT_FILEPART_CODE_PREFIX
export const PATH_HASH_ALGORITHM: IHashAlgorithm = 'sha256'
