import { text2bytes } from '@guanghechen/byte'
import type { IHashAlgorithm } from '@guanghechen/helper-mac'

export * from '@guanghechen/helper-git/__test__/_data-repo1'

export const repo1CryptCommitIdTable = {
  A: '3383cd9f2d81477277cc71a82ffcf84d05f5fa68',
  B: '8c3045fd284c8af652eea93101187bd424d6295e',
  C: '08093f437a6e8647209e88795636a9eb32fde29a',
  D: '42758d40ebb04c2b237ddc98559281f6d7ffa911',
  E: '36cd985c811c9b180ddc65091ce2057207974d3b',
  F: '2bd6036fcbdd7fd83c52045cd7047ad7f92e1615',
  G: '7e79f58df070afde8bd8072c528594149a60d5fa',
  H: '529eca33d4e3931c6794391351f0273c1a04939b',
  I: 'a39ead1cdd641bd4e0204bfb02b374e2be2da968',
  J: '363ca08ffebd25594a005ff8953a27a6836aa777',
  K: '0a2d654b4b04f6e9841acbb18ba4f4db4aaa4c64',
}

export const repo1CryptCommitMessageTable = {
  A: '97bd8d84dc83c508077b247206ccb696eb066828c88ba62f96a0388061189093',
  B: '8ef2579bebef6f8de168d94dc51557b696bdeadd91cd54dae8c5adaa056bd5ab',
  C: 'f56f745fe0ca5729d11b9f6245d3dd6b92ab65d0071d2f44fb87d829db0f0bf1',
  D: 'c9f30d2c4ae5f85262d7c0f937f908269ff170fa860a084c801e4043c4809777',
  E: 'e35842380c2943afbf6c488340217debe8a286f3357ab0deaafe8bae511b896f',
  F: '4686d1873916f43c116d3ce3dfd11eb271371363b1ef93274c0034f0b8479b71',
  G: '2d683f93b46b83572ecc281132deaf6e2da3ecc43935605178381631a2f1530b',
  H: '77dfd635e6db3d6d1c71df9f5cb33bce084584ffccba91d73a47a0e7f25683f9',
  I: 'c667c67de669e93c33d597deb746c9257768208a1f58bd3f1d995eccfdaa15ba',
  J: '5191065827930de1fb814932e2a6064bba4f12d0472cf1ece8e823da817615c1',
  K: '79861cb279ecfa722603ccd0d601d07d90cc1899abf8e51b0e83907b0decc0d4',
}

export const itemTable = {
  A: {
    plainFilepath: 'a.txt',
    cryptFilepath: 'a.txt',
    cryptFilepathParts: [],
    fingerprint: '4e26698e6bebd87fc210bec49fea4da6210b5769dbff50b3479effa16799120f',
    keepPlain: true,
    iv: text2bytes('c187594c5ea799e7a2f035c8', 'hex'),
    authTag: undefined,
  },
  A2: {
    plainFilepath: 'a.txt',
    cryptFilepath: 'a.txt',
    cryptFilepathParts: [],
    fingerprint: '4ec33c94039179da5febb8936428e80e7b0d3f42689a4adb38fc8e479634eeb8',
    keepPlain: true,
    iv: text2bytes('2f237981516b8c14dba4ebc1', 'hex'),
    authTag: undefined,
  },
  B: {
    plainFilepath: 'b.txt',
    cryptFilepath: 'asuna/7162c5dc69f5c2855c2fa7e454c8e4ed7e03a47c91b55be24e8931b8b099ed93',
    cryptFilepathParts: [],
    fingerprint: '965bfea36969b0b94ab0665baedd328c37f200340b937c07fdb6885ea363993c',
    keepPlain: false,
    iv: text2bytes('78d4b1241450d0151830c2b7', 'hex'),
    authTag: text2bytes('d3c7c317aa627a4d7f9fe82b870e48ef', 'hex'),
  },
  B2: {
    plainFilepath: 'b.txt',
    cryptFilepath: 'asuna/7162c5dc69f5c2855c2fa7e454c8e4ed7e03a47c91b55be24e8931b8b099ed93',
    cryptFilepathParts: ['.ghc-part1', '.ghc-part2'],
    fingerprint: '88d03f260a5158dd23220ae24160320df2ec63840dac45ad4c99cc6d0208e248',
    keepPlain: false,
    size: 1650,
    iv: text2bytes('951619437ddaca2c541fc426', 'hex'),
    authTag: text2bytes('98d90ea1b70933470b489ec2d44e2c02', 'hex'),
  },
  C: {
    plainFilepath: 'x/c.txt',
    cryptFilepath: 'asuna/0114c437562d21ed83066b8af1836df8783f5eaea3646ab14da6f7f4ef957083',
    cryptFilepathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3'],
    fingerprint: 'fd7dc434ab208f15cd61dcc39e8e67de75a1cc6e1c6c9268d653a01b819da054',
    keepPlain: false,
    iv: text2bytes('f5be427ea24681db4f08ec14', 'hex'),
    authTag: text2bytes('9003e392320bfa3581669d18d8d747cf', 'hex'),
  },
  C2: {
    plainFilepath: 'x/c.txt',
    cryptFilepath: 'asuna/0114c437562d21ed83066b8af1836df8783f5eaea3646ab14da6f7f4ef957083',
    cryptFilepathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
    fingerprint: 'df91313a8fc51bce13227ad3b5e8eeea815fe149969c174b0f2da373dea473c1',
    keepPlain: false,
    iv: text2bytes('3c3a108f4a213e4b8fc1058f', 'hex'),
    authTag: text2bytes('028804f373b463785a87efc8830ed8b2', 'hex'),
  },
  C3: {
    plainFilepath: 'x/c.txt',
    cryptFilepath: 'asuna/0114c437562d21ed83066b8af1836df8783f5eaea3646ab14da6f7f4ef957083',
    cryptFilepathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4', '.ghc-part5'],
    fingerprint: 'ce9d19d55a13973f3e1f970e8915df800a1a61bd2f38212b55db73b8669ddcaf',
    keepPlain: false,
    iv: text2bytes('5a93a535b8da6037cb0cc62a', 'hex'),
    authTag: text2bytes('20d560824461b1bc490e78e9d0dca65e', 'hex'),
  },
  D: {
    plainFilepath: 'x/d.txt',
    cryptFilepath: 'asuna/a468e223dd684ed8393c6eeb2d7e29929b890aa186f02d570a93a514ad72ebde',
    cryptFilepathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
    fingerprint: '40cb73b4c02d34812f38a5ca3a3f95d377285e83d7bb499573b918e1862bcf13',
    keepPlain: false,
    iv: text2bytes('68d8d715d8b03d583ad595a8', 'hex'),
    authTag: text2bytes('03fcf614c9c443d34ac6c01375406197', 'hex'),
  },
  E: {
    plainFilepath: 'y/z/e.txt',
    cryptFilepath: 'asuna/ad931c88ceba4f06455236a3a58c3d8c04b7690e687ad5d4dded1b53d4d82763',
    cryptFilepathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
    fingerprint: '40cb73b4c02d34812f38a5ca3a3f95d377285e83d7bb499573b918e1862bcf13',
    keepPlain: false,
    iv: text2bytes('10b54292994a5316a47034ca', 'hex'),
    authTag: text2bytes('46457d180a528d3739550feea231e9cd', 'hex'),
  },
}

export const diffItemsTable = {
  stepA: [
    { changeType: 'added', newItem: itemTable.A },
    { changeType: 'added', newItem: itemTable.B },
  ],
  stepB: [
    { changeType: 'added', newItem: itemTable.C },
    { changeType: 'modified', oldItem: itemTable.A, newItem: itemTable.A2 },
  ],
  stepE: [
    { changeType: 'removed', oldItem: itemTable.B },
    { changeType: 'modified', oldItem: itemTable.C, newItem: itemTable.C2 },
  ],
  stepI: [
    { changeType: 'added', newItem: itemTable.D },
    { changeType: 'modified', oldItem: itemTable.B2, newItem: itemTable.B },
  ],
  stepK: [
    { changeType: 'removed', oldItem: itemTable.D },
    { changeType: 'added', newItem: itemTable.E },
  ],
}

export const cryptFilesDir = 'asuna'
export const maxTargetFileSize = 1024
export const partCodePrefix = '.ghc-part'
export const contentHashAlgorithm: IHashAlgorithm = 'sha256'
export const pathHashAlgorithm: IHashAlgorithm = 'sha256'
