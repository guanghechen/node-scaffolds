import { text2bytes } from '@guanghechen/byte'
import type { ICatalogDiffItem, ICatalogItem } from '@guanghechen/cipher-catalog'
import { FileChangeTypeEnum } from '@guanghechen/cipher-catalog'
import type { IHashAlgorithm } from '@guanghechen/mac'

export * from '@guanghechen/helper-git/__test__/_data-repo1'

type ISymbol = 'A' | 'A2' | 'B' | 'B2' | 'C' | 'C2' | 'C3' | 'D' | 'E'

export const repo1CryptCommitIdTable = {
  A: 'abad68fa47433c0adebd71027eb16c89d0acdce2',
  B: 'b564967688fab0cff42f45340cc4f659ad497b17',
  C: '3fa27d22672072329d62777b5544835c1b686de5',
  D: '679ab0b642ab036d4fe11062491e93e1858d9761',
  E: 'dfcd6b5f544109b6fd5b7367287979f12d655d13',
  F: '536b575d010540fc008e705d08cc6a005f6bed37',
  G: '813a44c5dae0057b5ba79fc2c58405f505f91406',
  H: 'f7af8aefbc88e1859ead23571d6bea3dabbd34dc',
  I: 'cb027456a406245ab7f8a071078c565e37432415',
  J: 'c0619c27d4f67710134fd19b52c379f8c309fa90',
  K: '02933595d952d2b17d767098e7c6d270aafda7de',
}

export const repo1CryptCommitMessageTable = {
  A: '97bd8d84dc83c508077b247206ccb696eb066828c88ba62f96a0388061189093',
  B: '8ef2579bebef6f8de168d94dc51557b696bdeadd91cd54dae8c5adaa056bd5ab',
  C: 'f56f745fe0ca5729d11b9f6245d3dd6b92ab65d0071d2f44fb87d829db0f0bf1',
  D: '13859e55749bf781573dacd261b1994e1f154f9a858aa1bb8162d3fecd890a14',
  E: 'e35842380c2943afbf6c488340217debe8a286f3357ab0deaafe8bae511b896f',
  F: 'f7794c36e5accc419aae4b596554f3c63986c340d5be91fa1d5892d4560a44d0',
  G: '2d683f93b46b83572ecc281132deaf6e2da3ecc43935605178381631a2f1530b',
  H: '77dfd635e6db3d6d1c71df9f5cb33bce084584ffccba91d73a47a0e7f25683f9',
  I: 'c667c67de669e93c33d597deb746c9257768208a1f58bd3f1d995eccfdaa15ba',
  J: '5191065827930de1fb814932e2a6064bba4f12d0472cf1ece8e823da817615c1',
  K: '79861cb279ecfa722603ccd0d601d07d90cc1899abf8e51b0e83907b0decc0d4',
}

export const itemTable: Record<ISymbol, ICatalogItem> = {
  A: {
    authTag: undefined,
    cryptPath: 'a.txt',
    cryptPathParts: [''],
    fingerprint: '4e26698e6bebd87fc210bec49fea4da6210b5769dbff50b3479effa16799120f',
    keepIntegrity: false,
    keepPlain: true,
    nonce: text2bytes('c187594c5ea799e7a2f035c8d295a94d', 'hex'),
    plainPath: 'a.txt',
    size: 9,
  },
  A2: {
    authTag: undefined,
    cryptPath: 'a.txt',
    cryptPathParts: [''],
    fingerprint: '4ec33c94039179da5febb8936428e80e7b0d3f42689a4adb38fc8e479634eeb8',
    keepIntegrity: false,
    keepPlain: true,
    nonce: text2bytes('2f237981516b8c14dba4ebc15d2d52e0', 'hex'),
    plainPath: 'a.txt',
    size: 11,
  },
  B: {
    authTag: text2bytes('af09812baac2d80c4b53d61f69f4e6fc', 'hex'),
    cryptPath: 'asuna/f863b51aa82974d57aa78e3270b0e9f46172e2d1e7693ded5ea8e3c3c8f4fe76',
    cryptPathParts: [''],
    fingerprint: '965bfea36969b0b94ab0665baedd328c37f200340b937c07fdb6885ea363993c',
    keepIntegrity: false,
    keepPlain: false,
    nonce: text2bytes('78d4b1241450d0151830c2b79a521a2f', 'hex'),
    plainPath: 'b.txt',
    size: 9,
  },
  B2: {
    authTag: text2bytes('98d90ea1b70933470b489ec2d44e2c02', 'hex'),
    cryptPath: 'asuna/f863b51aa82974d57aa78e3270b0e9f46172e2d1e7693ded5ea8e3c3c8f4fe76',
    cryptPathParts: ['.ghc-part1', '.ghc-part2'],
    fingerprint: '88d03f260a5158dd23220ae24160320df2ec63840dac45ad4c99cc6d0208e248',
    keepIntegrity: false,
    keepPlain: false,
    nonce: text2bytes('951619437ddaca2c541fc426', 'hex'),
    plainPath: 'b.txt',
    size: 1650,
  },
  C: {
    authTag: text2bytes('9003e392320bfa3581669d18d8d747cf', 'hex'),
    cryptPath: 'asuna/0114c437562d21ed83066b8af1836df8783f5eaea3646ab14da6f7f4ef957083',
    cryptPathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3'],
    fingerprint: 'fd7dc434ab208f15cd61dcc39e8e67de75a1cc6e1c6c9268d653a01b819da054',
    keepIntegrity: false,
    keepPlain: false,
    nonce: text2bytes('f5be427ea24681db4f08ec14', 'hex'),
    plainPath: 'x/c.txt',
    size: 3150,
  },
  C2: {
    authTag: text2bytes('65205e538d051e63a6f908a1df781db2', 'hex'),
    cryptPath: 'asuna/c2be1cbefe0eec8eba138b634d4eadbf9b587c7cd36fc9097a20fcf908647067',
    cryptPathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
    fingerprint: 'df91313a8fc51bce13227ad3b5e8eeea815fe149969c174b0f2da373dea473c1',
    keepIntegrity: false,
    keepPlain: false,
    nonce: text2bytes('3c3a108f4a213e4b8fc1058fe695ac07', 'hex'),
    plainPath: 'x/c.txt',
    size: 3850,
  },
  C3: {
    authTag: text2bytes('35c6716782bb3ac16d461ccf4c40c15d', 'hex'),
    cryptPath: 'asuna/c2be1cbefe0eec8eba138b634d4eadbf9b587c7cd36fc9097a20fcf908647067',
    cryptPathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4', '.ghc-part5'],
    fingerprint: 'ce9d19d55a13973f3e1f970e8915df800a1a61bd2f38212b55db73b8669ddcaf',
    keepIntegrity: false,
    keepPlain: false,
    nonce: text2bytes('5a93a535b8da6037cb0cc62aefac4fed', 'hex'),
    plainPath: 'x/c.txt',
    size: 4180,
  },
  D: {
    authTag: text2bytes('b4b6b310d5b3bb4b8bf48d438ea4e627', 'hex'),
    cryptPath: 'asuna/d14500346f970e57dddf66aef9f506871a5a02683767e099a428a94337caebd0',
    cryptPathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
    fingerprint: '40cb73b4c02d34812f38a5ca3a3f95d377285e83d7bb499573b918e1862bcf13',
    keepIntegrity: false,
    keepPlain: false,
    nonce: text2bytes('68d8d715d8b03d583ad595a87fdc945e', 'hex'),
    plainPath: 'x/d.txt',
    size: 3150,
  },
  E: {
    authTag: text2bytes('57f0ff1aa1ae81bfb7eb650be189f6a1', 'hex'),
    cryptPath: 'asuna/f6c4d2d08d4d7aa889acc04c2630c9b59ffc7b72ab5cda5e39316a23ae7ac5b6',
    cryptPathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
    fingerprint: '40cb73b4c02d34812f38a5ca3a3f95d377285e83d7bb499573b918e1862bcf13',
    keepIntegrity: false,
    keepPlain: false,
    nonce: text2bytes('10b54292994a5316a47034cabe5d25f2', 'hex'),
    plainPath: 'y/z/e.txt',
    size: 3150,
  },
}

export const diffItemsTable: Record<
  'stepA' | 'stepB' | 'stepE' | 'stepI' | 'stepK',
  ICatalogDiffItem[]
> = {
  stepA: [
    { changeType: FileChangeTypeEnum.ADDED, newItem: itemTable.A },
    { changeType: FileChangeTypeEnum.ADDED, newItem: itemTable.B },
  ],
  stepB: [
    { changeType: FileChangeTypeEnum.ADDED, newItem: itemTable.C },
    { changeType: FileChangeTypeEnum.MODIFIED, oldItem: itemTable.A, newItem: itemTable.A2 },
  ],
  stepE: [
    { changeType: FileChangeTypeEnum.REMOVED, oldItem: itemTable.B },
    { changeType: FileChangeTypeEnum.MODIFIED, oldItem: itemTable.C, newItem: itemTable.C2 },
  ],
  stepI: [
    { changeType: FileChangeTypeEnum.ADDED, newItem: itemTable.D },
    { changeType: FileChangeTypeEnum.MODIFIED, oldItem: itemTable.B2, newItem: itemTable.B },
  ],
  stepK: [
    { changeType: FileChangeTypeEnum.REMOVED, oldItem: itemTable.D },
    { changeType: FileChangeTypeEnum.ADDED, newItem: itemTable.E },
  ],
}

export const CONTENT_HASH_ALGORITHM: IHashAlgorithm = 'sha256'
export const CRYPT_FILES_DIR = 'asuna'
export const MAX_CRYPT_FILE_SIZE = 1024
export const NONCE_SIZE = 16
export const PART_CODE_PREFIX = '.ghc-part'
export const PATH_HASH_ALGORITHM: IHashAlgorithm = 'sha256'
