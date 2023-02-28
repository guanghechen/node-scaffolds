import type { IHashAlgorithm } from '@guanghechen/helper-mac'

export * from '@guanghechen/helper-git/__test__/_data-repo1'

export const repo1CryptCommitIdTable = {
  A: 'fad3c6db42571ed6c2f48ba9e7b7f75ee3b8e328',
  B: '8edffe3781a61e1e542f4f9af8a13f58e5197c36',
  C: '90e3f12fb634343d32ec04c2fcf084083d36a54e',
  D: '99d394a1fa63f7ec8d3e9c0c59c9ba0bd1262dce',
  E: '8e8afc6b41c14321b4ccfbf755534354ec9cce05',
  F: 'a55645b3caec41a6c5384b064359c52f4b3726bd',
  G: 'd9eae9d91e0f9345e47cbc77590640edbac10ee1',
  H: 'b9ba89528832cbe2303ca9537d254558abbcfe2b',
  I: '2e247f16f893b112cc28e51eb9a8b3c49a40e4b1',
  J: 'e7b530a1796f1a206a02341fdfb5df0a772b3f35',
  K: '7df3706a51d8e62c72c83bfc22ee70b015a69e8c',
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
    iv: Buffer.from('c65b6cc1c81a805ba6a7187e', 'hex'),
    authTag: undefined,
  },
  A2: {
    plainFilepath: 'a.txt',
    cryptFilepath: 'a.txt',
    cryptFilepathParts: [],
    fingerprint: '4ec33c94039179da5febb8936428e80e7b0d3f42689a4adb38fc8e479634eeb8',
    keepPlain: true,
    iv: Buffer.from('2b6d63cbde1c274dfe8ba9bc', 'hex'),
    authTag: undefined,
  },
  B: {
    plainFilepath: 'b.txt',
    cryptFilepath: 'asuna/7162c5dc69f5c2855c2fa7e454c8e4ed7e03a47c91b55be24e8931b8b099ed93',
    cryptFilepathParts: [],
    fingerprint: '965bfea36969b0b94ab0665baedd328c37f200340b937c07fdb6885ea363993c',
    keepPlain: false,
    iv: Buffer.from('44ad63f5398f8d806658f35d', 'hex'),
    authTag: Buffer.from('4ecc052246ff595a5549510b4a639105', 'hex'),
  },
  B2: {
    plainFilepath: 'b.txt',
    cryptFilepath: 'asuna/7162c5dc69f5c2855c2fa7e454c8e4ed7e03a47c91b55be24e8931b8b099ed93',
    cryptFilepathParts: ['.ghc-part1', '.ghc-part2'],
    fingerprint: '88d03f260a5158dd23220ae24160320df2ec63840dac45ad4c99cc6d0208e248',
    keepPlain: false,
    size: 1650,
    iv: Buffer.from('c2e17ce7a041aa6a34b6508a', 'hex'),
    authTag: Buffer.from('ddcc8070520f86d9ba48a43d17b4bfb5', 'hex'),
  },
  C: {
    plainFilepath: 'x/c.txt',
    cryptFilepath: 'asuna/0114c437562d21ed83066b8af1836df8783f5eaea3646ab14da6f7f4ef957083',
    cryptFilepathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3'],
    fingerprint: 'fd7dc434ab208f15cd61dcc39e8e67de75a1cc6e1c6c9268d653a01b819da054',
    keepPlain: false,
    iv: Buffer.from('ea36cfca05bee4b045956a1f', 'hex'),
    authTag: Buffer.from('dff151f0961471d5782eed60e57ed5af', 'hex'),
  },
  C2: {
    plainFilepath: 'x/c.txt',
    cryptFilepath: 'asuna/0114c437562d21ed83066b8af1836df8783f5eaea3646ab14da6f7f4ef957083',
    cryptFilepathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
    fingerprint: 'df91313a8fc51bce13227ad3b5e8eeea815fe149969c174b0f2da373dea473c1',
    keepPlain: false,
    iv: Buffer.from('38eff44fe4585a632a75464a', 'hex'),
    authTag: Buffer.from('90ec961ea6e2936020f6be60ec0b6239', 'hex'),
  },
  C3: {
    plainFilepath: 'x/c.txt',
    cryptFilepath: 'asuna/0114c437562d21ed83066b8af1836df8783f5eaea3646ab14da6f7f4ef957083',
    cryptFilepathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4', '.ghc-part5'],
    fingerprint: 'ce9d19d55a13973f3e1f970e8915df800a1a61bd2f38212b55db73b8669ddcaf',
    keepPlain: false,
    iv: Buffer.from('362b53ef8d8ac14d4689bca3', 'hex'),
    authTag: Buffer.from('2674b106e4f472435f2b9e8ce2a6d83a', 'hex'),
  },
  D: {
    plainFilepath: 'x/d.txt',
    cryptFilepath: 'asuna/a468e223dd684ed8393c6eeb2d7e29929b890aa186f02d570a93a514ad72ebde',
    cryptFilepathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
    fingerprint: '40cb73b4c02d34812f38a5ca3a3f95d377285e83d7bb499573b918e1862bcf13',
    keepPlain: false,
    iv: Buffer.from('6a60b80f8e5c5d6772cda449', 'hex'),
    authTag: Buffer.from('333e0019fff2b8f293cdb1f698ef114e', 'hex'),
  },
  E: {
    plainFilepath: 'y/z/e.txt',
    cryptFilepath: 'asuna/ad931c88ceba4f06455236a3a58c3d8c04b7690e687ad5d4dded1b53d4d82763',
    cryptFilepathParts: ['.ghc-part1', '.ghc-part2', '.ghc-part3', '.ghc-part4'],
    fingerprint: '40cb73b4c02d34812f38a5ca3a3f95d377285e83d7bb499573b918e1862bcf13',
    keepPlain: false,
    iv: Buffer.from('6a60b80f8e5c5d6772cda449', 'hex'),
    authTag: Buffer.from('333e0019fff2b8f293cdb1f698ef114e', 'hex'),
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
