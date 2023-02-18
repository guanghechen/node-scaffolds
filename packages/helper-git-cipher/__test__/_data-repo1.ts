import type { IHashAlgorithm } from '@guanghechen/helper-mac'

export * from '@guanghechen/helper-git/__test__/_data-repo1'

export const repo1CryptCommitIdTable = {
  A: '4cc40acd7c49bbc757cb0d116dfa9707ea90411a',
  B: 'ce3bf25ca7acdee54db72673c303890b241ec875',
  C: 'b3f1e195d5783f99a462ae6720d4fb5c13303516',
  D: 'c5e69c4ec51ed071890e506f82ab81734a64fd42',
  E: '09c31c2699876373dcbfd6599b1b1bad25f75385',
  F: '140d499ce9013fb728113b62220e261976a25847',
  G: 'd99cc1641f69d42326fae0d9ab33eca1ea8d6d39',
  H: '0e0a0a2270fe9e23a6c63725044b687ea02d6165',
  I: 'c0a6748256fe496a35c4aa72ce630f151a2280e2',
  J: '50daeaf9034626ad9a5f755175d55aed341f097d',
  K: '365f5263ed4bd834f22b1d1724020ef6278880d3',
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

export const cryptFilesDir = 'encrypted'
export const maxTargetFileSize = 1024
export const partCodePrefix = '.ghc-part'
export const contentHashAlgorithm: IHashAlgorithm = 'sha256'
export const pathHashAlgorithm: IHashAlgorithm = 'sha256'
