# Changelog

<a name="4.4.3"></a>
## 4.4.3 (2023-02-26)

### Changed

- 🎨 improve(helper-git-cipher): update &#x27;GitCipherConfigKeeper&#x27; [[2e398ba](https://github.com/guanghechen/node-scaffolds/commit/2e398baa1b50c1ec9f0b2fd64c30baf9df35ecb2)]


<a name="4.4.2"></a>
## 4.4.2 (2023-02-26)

### Added

- ✨ feat(helper-git): add new method &#x27;getParentCommitIdList&#x27; [[ce0e10e](https://github.com/guanghechen/node-scaffolds/commit/ce0e10e60515edd71be687a5d5427a6eb38eda7d)]

### Changed

- 🎨 improve(helper-git-cipher): refactor &#x27;GitCipherConfigKeeper&#x27; [[549a382](https://github.com/guanghechen/node-scaffolds/commit/549a3823be388084c0c66b80a6ef031f0a39a38f)]


<a name="4.4.1"></a>
## 4.4.1 (2023-02-25)

### Changed

- 🎨 improve(tool-git-cipher): ask to input &#x27;cryptFilesDir&#x27; in init ux [[ec2a86f](https://github.com/guanghechen/node-scaffolds/commit/ec2a86f7f8c29ce2f07e71205159a21f3ba2907f)]
- 🍱 improve(tool-git-cipher): fix boilerplates [[0971c05](https://github.com/guanghechen/node-scaffolds/commit/0971c05ecd1cb456e290df79c2c5d69c8c7c068f)]

### Fixed

- 🐛 fix(tool-git-cipher): cryptCommitHash may be the &#x27;HEAD&#x27; pointer, which cannot find from the id map [[846955f](https://github.com/guanghechen/node-scaffolds/commit/846955f6dd8048fde5d8fbfcb421a7ffd242d494)]


<a name="4.4.0"></a>
## 4.4.0 (2023-02-25)

### Added

- ✨ feat(helper-git-cipher): add verify [[b6ab821](https://github.com/guanghechen/node-scaffolds/commit/b6ab821ef353ca74e24903ce026c5c6797e6982f)]
- ✅ fix test [[0aae085](https://github.com/guanghechen/node-scaffolds/commit/0aae0857d9dc03a398281736c5b11bee606c094d)]
- ✨ feat(tool-git-cipher): add new sub-command &#x27;verify&#x27; [[19ad4ef](https://github.com/guanghechen/node-scaffolds/commit/19ad4efe89dd1c5d4c0364d890eb128f255d5dba)]
- ✨ feat(tool-git-cipher): add new sub command &#x27;cat&#x27; [[4cede2d](https://github.com/guanghechen/node-scaffolds/commit/4cede2dcc2223c951c6a3db9589dafb7c3e76d03)]
- ✨ feat(helper-git): add new method &#x27;showFileContent&#x27; [[d8b64d8](https://github.com/guanghechen/node-scaffolds/commit/d8b64d81544f0d3874e9f7883f318e8f4ec980f9)]
- ✨ feat: add @guanghechen/helper-storage [[8563caa](https://github.com/guanghechen/node-scaffolds/commit/8563caa19953eae27bfa4763e244e77a98840a28)]

### Changed

- ⬆️ chore: upgrade devDependencies [[3a4d2de](https://github.com/guanghechen/node-scaffolds/commit/3a4d2def1cc59fdabe58888da7970da348de538a)]
- 🎨 improve(tool-git-cipher): use verify from @guanghechen/helper-git-cipher [[8f48894](https://github.com/guanghechen/node-scaffolds/commit/8f48894e34ca35d4b62fa9f796d2ec426bc53c46)]
- 🎨 improve: rename &#x27;branchOrCommitId&#x27; to &#x27;commitHash&#x27; [[d3ed0c6](https://github.com/guanghechen/node-scaffolds/commit/d3ed0c6c63a69284bc8bd12aafe0bf52a8d67450)]
- 👽 fix build error due to previous changes [[e37c6f1](https://github.com/guanghechen/node-scaffolds/commit/e37c6f1e10db5a6a26b02142fd52c792c55ed689)]
- 🎨 improve(helper-config): refactor with FileStorage [[ddae50c](https://github.com/guanghechen/node-scaffolds/commit/ddae50c5ac62e43b8ca426c88557ed7d7dc6b655)]

### Fixed

- 🐛 fix(helper-git-cipher): persist plainParentIds instead of cryptParentIds since the crypt repo are stabler than plain repo [[366937a](https://github.com/guanghechen/node-scaffolds/commit/366937a59bff54762e260b6613ac9d4f8330fc93)]
- 🐛 fix(helper-git) bad result when there are blank spaces in filepath [[0380c87](https://github.com/guanghechen/node-scaffolds/commit/0380c87f6f062ebf8fb7b5dd5b5a05d8cb2362a5)]
- 🐛 fix(tool-git-cipher): need pass a relative path to &#x27;showFileContent&#x27; [[33fa4ef](https://github.com/guanghechen/node-scaffolds/commit/33fa4efd40e4c738928cb1cd2146a5f355c9c035)]


<a name="4.3.0"></a>
## 4.3.0 (2023-02-21)

### Changed

- 👽 fix(tool-git-cipher) build error [[2fc7207](https://github.com/guanghechen/node-scaffolds/commit/2fc7207f1bc7194003230f0837e151677b7f646d)]
- 🎨 [BREAKING] refactor(helper-git-cipher): rewrite GitCipherConfigKeeper serialize/deserialize [[2eb7541](https://github.com/guanghechen/node-scaffolds/commit/2eb75412aeaadcc6baf4eb476a7591f26707e0f6)]
- 🎨 refactor: fix build error due to the previous change [[670ca4c](https://github.com/guanghechen/node-scaffolds/commit/670ca4c27438d95c6c73a327e38e449bee5928ca)]
- 🎨 refactor(helper-cipher): move some properties and methods from CipherFactory to CipherFactoryBuilder [[dd76db4](https://github.com/guanghechen/node-scaffolds/commit/dd76db4292e8fe9636325cbf407db3378a242e61)]


<a name="4.2.2"></a>
## 4.2.2 (2023-02-20)

### Changed

- 🎨 improve(tool-git-cipher): ask input new password until the confirmation matched [[68b22a1](https://github.com/guanghechen/node-scaffolds/commit/68b22a1f89674548f2a56a47f9014ea1386fc45f)]
- 🎨 improve(tool-git-cipher): ask to input maxTargetFileSize [[f8343c8](https://github.com/guanghechen/node-scaffolds/commit/f8343c866ed005c6d2ff5109ac571beabe10a440)]
- 🎨 improve(tool-git-cipher): generate random salt [[d099aa3](https://github.com/guanghechen/node-scaffolds/commit/d099aa305b70f0c615bd757c35ab69e3700dc787)]


<a name="4.2.1"></a>
## 4.2.1 (2023-02-20)

### Fixed

- 🐛 fix(tool-git-cipher): incorrect cryptFilesDir [[4a01c41](https://github.com/guanghechen/node-scaffolds/commit/4a01c41fbee432504a0d631deecbe60a93ff1ecb)]


<a name="4.2.0"></a>
## 4.2.0 (2023-02-19)

### Added

- ✨ feat(helper-path): add FilepathResolver [[5292958](https://github.com/guanghechen/node-scaffolds/commit/52929584abe3382160b93b9df2259fe4726ba9ff)]

### Changed

- 👽 improve: fix build errors due to the previous changes [[5e36177](https://github.com/guanghechen/node-scaffolds/commit/5e361771b84dadef1279f704969f448f45b86233)]
- 🎨 [BREAKING] refactor(helper-git-cipher): refactor GitCipher [[1a094f5](https://github.com/guanghechen/node-scaffolds/commit/1a094f542c6e79d20a545c66d7bbb996254afbfc)]
- 🎨 [BREAKING] refactor(helper-cipher-file): remove FileCipherPathResolver, use FilepathResolver from &#x27;@guanghechen/helper-path&#x27; instead [[8d49c45](https://github.com/guanghechen/node-scaffolds/commit/8d49c4530b0342bee616b3a8eb179d08ea24ed4b)]
- 🚚 rename(helper-git-cipher): rename GitCipherConfig to GitCipherConfigKeeper [[0952663](https://github.com/guanghechen/node-scaffolds/commit/0952663d8bb6742f6f90d48885b56242e25fba06)]
- 👽 fix build error due to previous changes [[963d496](https://github.com/guanghechen/node-scaffolds/commit/963d4968a642f869ff4d8789132490f86bb8f09a)]
- 🎨 improve: remove duplicate fields in GitCipherConfig [[60dd38e](https://github.com/guanghechen/node-scaffolds/commit/60dd38e5837e85ef8c803a05d0c74ea9a49806fe)]
- 🎨 improve(helper-cipher-file): add &#x27;flatCatalogItem&#x27; to FileCipherCatalog [[34765fb](https://github.com/guanghechen/node-scaffolds/commit/34765fbe4895f97247445fb608435f543ddbe566)]
- 🎨 [BREAKING] improve(helper-cipher-file): refactor types [[e11d1b1](https://github.com/guanghechen/node-scaffolds/commit/e11d1b1610ad46dc397792f18f0d9dbf2c0d6e4c)]
- 🎨 improve(tool-git-cipher) init ux [[f7f4390](https://github.com/guanghechen/node-scaffolds/commit/f7f43900519a3f607e4b4433fa149c8c2ebb49c0)]


<a name="4.1.3"></a>
## 4.1.3 (2023-02-18)

### Added

- ✅ test: update tests [[ca2f2a9](https://github.com/guanghechen/node-scaffolds/commit/ca2f2a9b7f3abdbc0e39e9f1f9ef6595eb5422a1)]
- ✅ test: update tests [[9581541](https://github.com/guanghechen/node-scaffolds/commit/95815413d1c41301d03d8717281aa2b2b49f0c6f)]

### Changed

- 🎨 improve(helper-git-cipher): prevent record absolute filepaths in catalog [[3738cf6](https://github.com/guanghechen/node-scaffolds/commit/3738cf6c4d93abf08c89556ef0ddce144100e7c0)]

### Fixed

- 🐛 fix(tool-git-cipher): [init] cancel plop processing if a remote repo specified [[739ab2b](https://github.com/guanghechen/node-scaffolds/commit/739ab2b584d4a821734f66a1cbc3be13fc496ad3)]
- 🐛 fix(helper-cipher-file): ensure the cryptFilesDir is a relative path [[7cd341e](https://github.com/guanghechen/node-scaffolds/commit/7cd341e2dd74eece83cba0e3a53a434f9189d367)]

### Miscellaneous

- 📝 docs: update READMEs [[2f9d01c](https://github.com/guanghechen/node-scaffolds/commit/2f9d01cfcf5afdab96a482bb3c7a7ef87c8e4028)]


<a name="4.1.2"></a>
## 4.1.2 (2023-02-18)

### Fixed

- 🐛 fix(tool-git-cipher): wait to retry if password wrong [[500b458](https://github.com/guanghechen/node-scaffolds/commit/500b458b1220f848269a78265d6269d5d78edec5)]


<a name="4.1.1"></a>
## 4.1.1 (2023-02-18)

### Changed

- 🔧 chore: update yarn.lock [[6b5743c](https://github.com/guanghechen/node-scaffolds/commit/6b5743ce3f257b4bb4f77900619217d243fa633a)]
- ⬆️ chore: upgrade devDependencies [[e46df0d](https://github.com/guanghechen/node-scaffolds/commit/e46df0def851adee643918b6626f1f867eb729e4)]
- 🔧 chore: remove unnecessary devDependencies [[f717518](https://github.com/guanghechen/node-scaffolds/commit/f71751803558970cccde05f96bff63436db8e2aa)]


<a name="4.1.0"></a>
## 4.1.0 (2023-02-18)

### Added

- ✨ feat: add new sub-package &#x27;@guanghechen/helper-mac [[67cbb7c](https://github.com/guanghechen/node-scaffolds/commit/67cbb7c864d619c550d70098d1bbdc2e7726e0e9)]
- ✨ feat: add new sub-package &#x27;@guanghechen/helper-buffer&#x27; [[502ad8c](https://github.com/guanghechen/node-scaffolds/commit/502ad8c4dfd93b7bda167900372707be53c151ca)]

### Changed

- 👽 fix errors due to previous changes [[6741498](https://github.com/guanghechen/node-scaffolds/commit/674149805f89fa0166c7665c2f9a6bb24b19fb32)]

### Breaking changes

- 💥 [BREAKING] improve(helper-cipher-file): ask to specify pathHashAlgorithm and contentHashAlgorithm for FileCipherCatalog [[c9f0ca7](https://github.com/guanghechen/node-scaffolds/commit/c9f0ca712845f9e8f445e2500de084bd074d0ccf)]
- 💥 [BREAKING] improve(helper-cipher): no longer export &#x27;calcMac&#x27; / &#x27;destryoBuffers&#x27;, use @guanghechen/helper-mac instead [[957a455](https://github.com/guanghechen/node-scaffolds/commit/957a455ee1ed3a38263bf3392a15f444f6cbcf34)]
- 💥 [BREAKING] improve(helper-config): no longer export &#x27;calcMac&#x27;, use @guanghechen/helper-mac instead [[c12e11b](https://github.com/guanghechen/node-scaffolds/commit/c12e11b12aadd13d21eaa25fd7e54f04237c371e)]
- 💥 [BREAKING] improve(helper-stream): no longer export &#x27;destroyBuffers&#x27;, use @guanghechen/helper-buffer instead [[9ee9000](https://github.com/guanghechen/node-scaffolds/commit/9ee9000fd4f05d4799ea9d7227a27099a8caaa14)]

### Miscellaneous

- 📝 docs: update README [[bc1ada0](https://github.com/guanghechen/node-scaffolds/commit/bc1ada09c02ebf6eaf21164735ac2f2d9de6a80e)]


<a name="4.0.0"></a>
## 4.0.0 (2023-02-13)

### Changed

- 🎨 improve(tool-git-cipher): init repo in plainRoot instead of workspace [[dd2e613](https://github.com/guanghechen/node-scaffolds/commit/dd2e6132d16b898675b3077c5bb77f6b05aaef0e)]
- 🎨 improve(tool-git-cipher): generate secret nonce [[52c8430](https://github.com/guanghechen/node-scaffolds/commit/52c8430dc9b41b6091801f112ff7c51c6accbcaf)]
- 🎨 improve(helper-git-cipher): support to pass a &#x27;getDynamicIv&#x27; to generate iv while batch encrypting [[5f689cb](https://github.com/guanghechen/node-scaffolds/commit/5f689cbaba8685f1213f10b5820aa09ffd2662b3)]
- 🎨 improve(helper-cipher): expose keySize and ivSize from CipherFactory [[f1d7e3e](https://github.com/guanghechen/node-scaffolds/commit/f1d7e3efee44ee95e6337847bd1ccdf1c3e5bc4f)]
- 🎨 improve(tool-git-cipher): update secret intializer prompts [[425c9b0](https://github.com/guanghechen/node-scaffolds/commit/425c9b09924cf4cc7da38dc50af8667a745a6306)]

### Miscellaneous

- 📝 docs(chalk-logger): fix snapshots src url [[5141fc1](https://github.com/guanghechen/node-scaffolds/commit/5141fc1ec7fe5d1207c0738165d071ec6846ec93)]


<a name="4.0.0-alpha.8"></a>
## 4.0.0-alpha.8 (2023-02-12)

### Changed

- 🎨 improve(tool-git-cipher): better ux &amp; support to regenerate secret [[227933b](https://github.com/guanghechen/node-scaffolds/commit/227933b63c4cb6a4d7c13b09ed2e44b7a8a9bae3)]


<a name="4.0.0-alpha.7"></a>
## 4.0.0-alpha.7 (2023-02-12)

### Added

- ✨ feat(helper-cipher-file): add CipherJsonConfigKeeper [[137c3d9](https://github.com/guanghechen/node-scaffolds/commit/137c3d9a08e112af34ced763c27e7482699a5b62)]
- ✨ feat: implement @guanghechen/helper-config to resolver config files [[15d8832](https://github.com/guanghechen/node-scaffolds/commit/15d883210f8f0fb5b3e7a18a77dac5876ca22c52)]
- ✨ [BREAKING] feat: refactor helper-cipher-file interfaces [[d472941](https://github.com/guanghechen/node-scaffolds/commit/d4729418202eca3aa6082efe450bb272f158cf28)]
- ✨ [BREAKING] feat: refactor helper-cipher interfaces [[cc4c2f8](https://github.com/guanghechen/node-scaffolds/commit/cc4c2f8dd396f141f6b1fc4a3c95f8ef14e9c056)]
- ✨ [BREAKING] feat(helper-git-cipher): no longer dependent the plain commit ids [[f92200c](https://github.com/guanghechen/node-scaffolds/commit/f92200cfdfa55037ffd3424385ac8633d3e092ed)]

### Changed

- 🎨 improve(tool-git-cipher): avoid duplicated password request [[9613994](https://github.com/guanghechen/node-scaffolds/commit/96139946a1f3554699fa8d3ab792bafbb9d351b3)]
- 🎨 improve(tool-git-cipher): rearrange options and boilerplates [[17041fe](https://github.com/guanghechen/node-scaffolds/commit/17041fee300dec5330488c83137b20e0ba050474)]
- 🎨 improve(tool-git-cipher): remove useless variables [[a4e81c5](https://github.com/guanghechen/node-scaffolds/commit/a4e81c528a1b4b6c656190cec35761c3c30a98db)]
- 🎨 improve(helper-commander): refactor with @guanghechen/helper-git [[1f6d18d](https://github.com/guanghechen/node-scaffolds/commit/1f6d18d33ccc21e43c456ac8b9a144fc70e5997a)]
- 🎨 improve: don&#x27;t set defaultValue for gpgSign [[8d8179f](https://github.com/guanghechen/node-scaffolds/commit/8d8179f92d184c0c672d671fb16be4c120309f8d)]
- 🎨 [BREAKING] refactor(chalk-logger): prefer the term &#x27;flight&#x27; to &#x27;flag&#x27; [[cd891d2](https://github.com/guanghechen/node-scaffolds/commit/cd891d21d559ab5876ccb8c95e274a76c8fc34f1)]
- 🎨 improve(chalk-logger): support specify multiple logFlag in one option like &#x27;--log-flag&#x3D;date,inline,no-colorful&#x27; [[1795ea3](https://github.com/guanghechen/node-scaffolds/commit/1795ea3b1a4eb2d3329a2fa0debc79b9ef7af99d)]
- 🎨 improve(chalk-logger): align label [[12be9ed](https://github.com/guanghechen/node-scaffolds/commit/12be9ede2cfe8768a7b409be606167f1da88cc49)]
- 🎨 improve(tool-git-cipher): rearrange options and boilerplates [[77e147a](https://github.com/guanghechen/node-scaffolds/commit/77e147a7917ca4505a3b8552b9cc13f7bb058e07)]
- 🎨 improve: make json config prettier [[22f8b83](https://github.com/guanghechen/node-scaffolds/commit/22f8b8370fc74826485fec2989d6df426b226585)]
- 👽 fix &amp; refactor @guanghechen/tool-git-cipher due to the dependencies changed [[6c43630](https://github.com/guanghechen/node-scaffolds/commit/6c436309e68832fa86cfd1daa9bee535bf4009f0)]
- 🎨 style: fix lint [[806065c](https://github.com/guanghechen/node-scaffolds/commit/806065c2666cef1b0f8464437113975fb8724e08)]
- 🎨 improve: fix types [[0b36dd7](https://github.com/guanghechen/node-scaffolds/commit/0b36dd741336511c46667bbef9562fc08392a97b)]
- 🎨 improve: rename encryptedFilesDir and encryptedFilePathSalt [[e1ac36d](https://github.com/guanghechen/node-scaffolds/commit/e1ac36d534345303cd7ce74fe9734befb96f5d02)]
- 🎨 improve: prefer base64 over hex [[ee5ff64](https://github.com/guanghechen/node-scaffolds/commit/ee5ff64c8fe433ee1c704a9259f82d20fadc4c4e)]
- 👽 fix build error due to the helper-config changes [[b563ce2](https://github.com/guanghechen/node-scaffolds/commit/b563ce28ff3941243750366ae37701f752e0d5dd)]
- 🎨 refactor(helper-config) ConfigKeeper [[3e713be](https://github.com/guanghechen/node-scaffolds/commit/3e713be4f92ec20c715d1a0cacb9ac77bf17436a)]
- 🎨 refactor(helper-git-cipher): refactor with ConfigKeeper [[494b9c1](https://github.com/guanghechen/node-scaffolds/commit/494b9c12c01a363ff21a3d48d635b2101b9ffc03)]
- 🎨 improve(helper-cipher): expose &#x60;cleanup()&#x60; from CipherFactory instance [[58bdd7a](https://github.com/guanghechen/node-scaffolds/commit/58bdd7a95193b428ab91220c7169714386a9bcb1)]
- 🎨 improve: prefer string type salt instead Buffer [[dc2bea5](https://github.com/guanghechen/node-scaffolds/commit/dc2bea5c8ebeabb9235781ae0b9d621993986ddb)]
- 👽 fix build errors due to the changes of helper-cipher and helper-cipher-file [[108c916](https://github.com/guanghechen/node-scaffolds/commit/108c916521271dfc7370f6178e8d9846b5d7d85a)]
- 🔧 chore: upgrade devDependencies [[320adbe](https://github.com/guanghechen/node-scaffolds/commit/320adbe4fdd15f859933c1eb913518e687942004)]

### Fixed

- 🐛 fix(tool-git-cipher): fix options and bad catalog cache [[3f654fb](https://github.com/guanghechen/node-scaffolds/commit/3f654fb6f748879eec135dfb2600447c239853c8)]
- 🐛 fix(helper-git-cipher): update crypt2plainIdMap after encrypt [[2b1d24e](https://github.com/guanghechen/node-scaffolds/commit/2b1d24e247c265748402bcf6cd5d224487c413cc)]
- 🐛 fix options resolver [[badd25d](https://github.com/guanghechen/node-scaffolds/commit/badd25d1226cc0b5149d4b11890b3b5833449726)]
- 🐛 fix(tool-git-cipher): fix wrong password [[2ed6382](https://github.com/guanghechen/node-scaffolds/commit/2ed6382ace469f7c305315180aad9176d1caceb1)]

### Miscellaneous

- 📝 docs(chalk-logger): update doc and demo snapshots [[e8df75c](https://github.com/guanghechen/node-scaffolds/commit/e8df75c8ae31107a90bb675c4d1b44d0754caaf7)]
- ⚰️ improve(helper-cipher-file): remove dead codes [[f758d72](https://github.com/guanghechen/node-scaffolds/commit/f758d72840f7f0d8cceb9931a975779a12be9e47)]


<a name="4.0.0-alpha.6"></a>
## 4.0.0-alpha.6 (2023-02-08)

### Added

- ✨ feat(tool-git-cipher): support to customize plainRootDir [[634fd72](https://github.com/guanghechen/node-scaffolds/commit/634fd72fd207666d0e200a94cd952465f855d8c5)]
- ✨ feat: add new method &#x27;getHeadBranchOrCommitId&#x27; [[f7488a8](https://github.com/guanghechen/node-scaffolds/commit/f7488a881d5c57d345a0e0305269767ca328423e)]
- ✨ feat(tool-git-cipher): support new option &#x27;--filesAt&#x27; on subCommand &#x27;decrypt&#x27; to decrypt files only [[b5d4005](https://github.com/guanghechen/node-scaffolds/commit/b5d4005f5028c2701168e3d8b28f1517984e9632)]
- ✅ test: update test snapshots due to the bugFix in chalk-logger [[d6b6958](https://github.com/guanghechen/node-scaffolds/commit/d6b6958d0a8088b3b0f3ff17093ced4905d93baa)]
- ✨ feat(helper-git-cipher): support decyptFilesOnly [[1327cc2](https://github.com/guanghechen/node-scaffolds/commit/1327cc2571d39d6f0c9a3b7d0183fb34cd174d6c)]

### Changed

- 🎨 improve: refactor ChalkLogger [[45368bd](https://github.com/guanghechen/node-scaffolds/commit/45368bdb80904a0adb166160c9e61942d030a003)]
- 🎨 [BREAKING] refactor ChalkLogger log format and no longer support to customize colors of logName and logDate [[680e18c](https://github.com/guanghechen/node-scaffolds/commit/680e18cfb02cf5c2515ddaf47ba91e12a1aac3bb)]
- 🎨 improve(tool-git-cipher): rename option &#x27;--filesAt&#x27; to &#x27;--filesOnly&#x27; [[d77aebc](https://github.com/guanghechen/node-scaffolds/commit/d77aebc7c35e4ab036610eaf644ffc1037b30c43)]
- 🎨 improve: restore the original branch after encrypt/decrypt even some errors occurred [[ce4a9bc](https://github.com/guanghechen/node-scaffolds/commit/ce4a9bc798a56ad7e350321424d7a85ff0e1bcd8)]
- 🎨 improve: fix lint &amp; prefer logger instead console.error [[c16bf5c](https://github.com/guanghechen/node-scaffolds/commit/c16bf5cb41a3d2eb4f7b0fcb41b06748d6f85172)]
- 🎨 improve(helper-git-cipher): remove untracked files after merging [[ad1a69c](https://github.com/guanghechen/node-scaffolds/commit/ad1a69cd789f79bdb798f8fde0e0e1aa61de232b)]

### Fixed

- 🐛 fix(tool-git-cipher): fix logic on resolving catalogFilepath &amp; update boilerplates [[05f2a03](https://github.com/guanghechen/node-scaffolds/commit/05f2a03b7f94222b7f2ace0aa3a8949defbbb40e)]
- 🐛 fix(chalk-logger): don&#x27;t print colors when flags.colorful set to false [[515b5d5](https://github.com/guanghechen/node-scaffolds/commit/515b5d54b274c584aefd3f44fb2c02d733469634)]

### Miscellaneous

- 📝 docs(chalk-logger): update demos [[6da72a7](https://github.com/guanghechen/node-scaffolds/commit/6da72a75b25286ce3ab50e58ea387166eeb8da36)]


<a name="4.0.0-alpha.5"></a>
## 4.0.0-alpha.5 (2023-02-05)

### Fixed

- 🐛 fix(helper-git*): fix inconsistent git date [[7c785c5](https://github.com/guanghechen/node-scaffolds/commit/7c785c5250d0da51ffa79e722dbc6fc48b5d13cb)]
- 🐛 fix(helper-git-cipher): ensure source repo is a git repo before encrypt/decrypt [[a2f20b0](https://github.com/guanghechen/node-scaffolds/commit/a2f20b02dcb75ea263d5411dbe7c44b707d94811)]

### Miscellaneous

-  improve(tool-git-cipher): update boilerplates [[1886b2a](https://github.com/guanghechen/node-scaffolds/commit/1886b2ac4b3a92b161c751588c6be38b0ed92ac1)]


<a name="4.0.0-alpha.4"></a>
## 4.0.0-alpha.4 (2023-02-04)

### Fixed

- 🐛 fix(tool-git-cipher): update boilerplates [[a931850](https://github.com/guanghechen/node-scaffolds/commit/a93185097e16c7d32811de82b90d13c050966d79)]


<a name="4.0.0-alpha.3"></a>
## 4.0.0-alpha.3 (2023-02-04)

### Fixed

- 🐛 fix(tool-git-cipher): update biolerplates [[6278ff3](https://github.com/guanghechen/node-scaffolds/commit/6278ff36d5577170893e466a9126edf5873fb207)]


<a name="4.0.0-alpha.2"></a>
## 4.0.0-alpha.2 (2023-02-04)

### Fixed

- 🐛 fix(tool-git-cipher): plainRootDir is not support &amp; perform &#x27;git init&#x27; after boilerplate files writen [[bec6b67](https://github.com/guanghechen/node-scaffolds/commit/bec6b67c0dcf535c3c75be4aeebbc0ffb8a62953)]


<a name="4.0.0-alpha.1"></a>
## 4.0.0-alpha.1 (2023-02-04)

### Added

- ✨ feat: add salt for generating encrypted filepath [[21be6b8](https://github.com/guanghechen/node-scaffolds/commit/21be6b8316689085e8ac19e6100a489f9f2f1a45)]

### Changed

- ⬆️ chore: upgrade devDependencies [[75c3da9](https://github.com/guanghechen/node-scaffolds/commit/75c3da99c657543aaa9a8c1517766f0044898b22)]
- 🎨 improve: update eslint configs [[e84481e](https://github.com/guanghechen/node-scaffolds/commit/e84481e24efaea95bfbca643f81aa7e66e1a2d74)]

### Fixed

- 🐛 fix(tool-git-cipher): add missing options [[cde258f](https://github.com/guanghechen/node-scaffolds/commit/cde258f37b3769b12913a5d3ee00710e278691ac)]
- 🐛 fix incorrect path in locateNearestFilepath [[b260264](https://github.com/guanghechen/node-scaffolds/commit/b26026463f3b628d689d13c4e968c7f274bfdf49)]
- 🐛 fix incorrect path in locateNearestFilepath [[4e4e9e7](https://github.com/guanghechen/node-scaffolds/commit/4e4e9e7db2d5b00c96551ad5eeee758cc31f8bdc)]
- 🐛 fix(tool-git-cipher): fix cli [[1687c43](https://github.com/guanghechen/node-scaffolds/commit/1687c435538be68d64fe029adc19fd3c6add139f)]


<a name="4.0.0-alpha.0"></a>
## 4.0.0-alpha.0 (2023-02-04)

### Added

- ✅ test(helper-git): update tests [[17e7513](https://github.com/guanghechen/node-scaffolds/commit/17e75134d1d36668df12e64442639cc109ca6a2e)]
- ✅ test(helper-git*): first commit id may be different [[d2912f4](https://github.com/guanghechen/node-scaffolds/commit/d2912f4db63abb5bd6dd8aa1de80f2f8872d0a91)]
- ✅ test: update tests [[4b2c8e9](https://github.com/guanghechen/node-scaffolds/commit/4b2c8e915e1b7139f3b7e4730706a5f0a774dcfe)]
- ✅ test: fix tests [[a6c674f](https://github.com/guanghechen/node-scaffolds/commit/a6c674fe9a70add256bc106d0a24042c33a33de5)]
- ✅ test: update tests [[c1866e1](https://github.com/guanghechen/node-scaffolds/commit/c1866e1ea03bb0923eadcd5eb8d4329a9721b613)]
- ✨ feat: implement @guanghechen/helper-git-cipher [[1802a9b](https://github.com/guanghechen/node-scaffolds/commit/1802a9b2f9f521fda28e92e95ff1e10a107a4970)]
- ✅ test(helper-file): refactor tests [[2d4a7e0](https://github.com/guanghechen/node-scaffolds/commit/2d4a7e0b71a8565f86bbe65ca4bb4cf5e3e4c08f)]
- ✨ feat: provide new method &#x27;falsy&#x27; and &#x27;truthy&#x27; [[5dca99d](https://github.com/guanghechen/node-scaffolds/commit/5dca99da36d7b13dc599d53be204ae005b553f61)]
- ✨ feat(helper-func): provide &#x27;filterIterable&#x27; and &#x27;mapIterable&#x27; [[f0f39f3](https://github.com/guanghechen/node-scaffolds/commit/f0f39f3faeb9d3ad94b92a44607108dfe11c95ea)]
- ✨ feat(helper-cipher-file): support &#x27;strickCheck&#x27; options for encryptDiff/decryptDiff [[e391445](https://github.com/guanghechen/node-scaffolds/commit/e3914450a710e8ab8a714015e3aadceebf005175)]
- ✨ feat(helper-cipher-file): provide new util method &#x27;collectAffectedEncFilepaths&#x27; and &#x27;collectAffectedSrcFilepaths&#x27; [[4562ebe](https://github.com/guanghechen/node-scaffolds/commit/4562ebee7c093f31e649f06f79cd448d6a81a5f1)]
- ✨ feat(helper-git): implement getCommitWithMessageList [[f061484](https://github.com/guanghechen/node-scaffolds/commit/f061484ffef09c45c78bcda84dc41c708f6db252)]
- ✨ feat(helper-cipher-file): implement JsonConfigKeeper [[70266d2](https://github.com/guanghechen/node-scaffolds/commit/70266d270589f4c2d54380766f1abc790975ca1e)]
- ✨ feat(helper-cipher): suport encrypt / decrypt json data [[abffa4e](https://github.com/guanghechen/node-scaffolds/commit/abffa4e84c0c5c1cdb052789bc9f56d2201331fb)]
- ✨ feat(helper-git): support to create/delete branch [[247c4a2](https://github.com/guanghechen/node-scaffolds/commit/247c4a229e26fdd09c440b3cb5f0edde55528103)]
- ✨ feat(helper-git): extract commitId in &#x27;getCommitIdByMessage&#x27; [[6cdf16b](https://github.com/guanghechen/node-scaffolds/commit/6cdf16b6c81a3e79ed8098ff176e869abaa374b2)]
- ✨ feat(helper-git): extract commitId in &#x27;showCommitInfo&#x27; [[cacb414](https://github.com/guanghechen/node-scaffolds/commit/cacb41435413893c8cab70bb691cc0a5b673400f)]
- ✨ feat(helper-git): support amend commit [[5f407b1](https://github.com/guanghechen/node-scaffolds/commit/5f407b15853da4936f289b33d4d1c17f8f7e2458)]
- ✨ feat(helper-git): impelment &#x27;cleanUntrackedFilepaths&#x27; [[d2a49de](https://github.com/guanghechen/node-scaffolds/commit/d2a49dec2bc6349fec4245dba1e95a2c82461592)]
- ✨ feat(helper-cipher-file): implement FileCipherCatalog.calcDiffItems [[1899734](https://github.com/guanghechen/node-scaffolds/commit/18997342356461321fd4ff06b1c486468f78a7b6)]
- ✅ chore: fix test coverage [[9a01b01](https://github.com/guanghechen/node-scaffolds/commit/9a01b01a3d21cb70e46eaa41fe7463849cf2d6dc)]
- ✨ feat(@guanghechen/helper-is): support &#x27;isPlainObject&#x27; [[64ee83c](https://github.com/guanghechen/node-scaffolds/commit/64ee83c12fcac71a6e3ddc62ebba1e2ac137cca9)]
- ✅ test: fix test coverage [[8488e8a](https://github.com/guanghechen/node-scaffolds/commit/8488e8a655735bc788a7a12dc6548a39c41fbadc)]
- ✨ feat: implement @guanghechen/helper-git [[af7bb39](https://github.com/guanghechen/node-scaffolds/commit/af7bb395c4b5d56ebb6235b59c5eb3f02f26ddac)]
- ✨ feat: implement @guanghechen/helper-cipher-file (abstract from helper-cipher) [[a661a46](https://github.com/guanghechen/node-scaffolds/commit/a661a46e94ab6942b3283fefce97404c52837861)]
- ✅ test: update tests [[19d16ec](https://github.com/guanghechen/node-scaffolds/commit/19d16ec43c5eb1cee4b35aade002e66ab51ea6c2)]
- ✅ test: update tests [[91b1516](https://github.com/guanghechen/node-scaffolds/commit/91b151624fd7f9694e9a3c67b2de47a9c5153eb4)]
- ✅ test: update tests [[2e9fddf](https://github.com/guanghechen/node-scaffolds/commit/2e9fddfec84565d6241552e4dcea2c6e0084528b)]
- ✅ test: update tests [[d06290d](https://github.com/guanghechen/node-scaffolds/commit/d06290dafb3a71341de17abfb92f0d0189a1cdf1)]
- ✅ test: fix failed tests [[dceb21a](https://github.com/guanghechen/node-scaffolds/commit/dceb21a8e2d6b105f2586317d7907564063f04bd)]
- ✅ test: update tests [[c7027bf](https://github.com/guanghechen/node-scaffolds/commit/c7027bf270f66feb492a2e03a6fbcd8a51d52edc)]
- ✅ test: update test snapshots [[ed88cb7](https://github.com/guanghechen/node-scaffolds/commit/ed88cb7a9516cb98b654f0b258240d33b457cd6d)]
- ✅ test: refactor tests [[9130ce5](https://github.com/guanghechen/node-scaffolds/commit/9130ce59f26cca22de825027eaf338c58b073646)]
- ✅ test: update tests for FileCipherPathResolver [[c642c62](https://github.com/guanghechen/node-scaffolds/commit/c642c6244f39c08c484b6865dfa531033aa282be)]
- ✨ [BREAKING] feat: implement @guanghechen/helper-fs &amp; move some methods from @guanghechen/helper-file and @guanghechen/helper-path to it [[51e1a57](https://github.com/guanghechen/node-scaffolds/commit/51e1a57838940bfba81d9c7b2b4c316b209c5d10)]
- ✨ feat(helper-cipher): add FileCipherCatalog [[bc7faa0](https://github.com/guanghechen/node-scaffolds/commit/bc7faa005abce1205b0ea78bf5f4c20ce2c6e041)]
- ✨ feat(helper-func): support new method &#x27;list2map&#x27; [[3c6b18c](https://github.com/guanghechen/node-scaffolds/commit/3c6b18c0afd581cc85d5511b8dbe540f12c4bd1c)]
- ✅ test: fix test [[04a5213](https://github.com/guanghechen/node-scaffolds/commit/04a5213af5b09a84a808ef4adb20fbde617a3e9d)]

### Changed

- 🎨 improve(helper-git): set defaultBranch by params for &#x27;git init&#x27; instead of executing new command [[e671996](https://github.com/guanghechen/node-scaffolds/commit/e671996f715e4d46e29451f3abf5edd305a60ae7)]
- 🔧 chore: update test configs [[7d9b49b](https://github.com/guanghechen/node-scaffolds/commit/7d9b49bb30821efd18bebeb431454a8bfd5ba9c1)]
- 🔧 chore(helper-git*): disable test in ci [[358cb80](https://github.com/guanghechen/node-scaffolds/commit/358cb80a96b598ca58dcecc76eedffbce1a0e986)]
- 🎨 improve: rename cryptDir to encryptedFilesDir [[985f1dd](https://github.com/guanghechen/node-scaffolds/commit/985f1dd24ed9d1b9defacbf63a57b6f661cf3a2a)]
- 🎨 improve: remove the multipleMessagePrefix param [[5846855](https://github.com/guanghechen/node-scaffolds/commit/5846855c56abed30a78bb6dd190728619cdeb73b)]
- 🎨 refactor(helper-git): reactor codes &amp; update tests [[2e392dd](https://github.com/guanghechen/node-scaffolds/commit/2e392dd6d248abc8e9af291fe3b2e5e6d7053070)]
- 🎨 improve: fix lint [[acb29b9](https://github.com/guanghechen/node-scaffolds/commit/acb29b98fb77691fa57b900a63b432c4a3cf04f4)]
- 🎨 improve(helper-cipher-file): pass pathResolver as params to &#x27;batchEncrypt&#x27; and &#x27;batchDecrypt&#x27; [[c19a393](https://github.com/guanghechen/node-scaffolds/commit/c19a393ce74d24443696be4c6fe6677ef4a90474)]
- 🎨 refactor: perfer the terms &#x27;plain/crypt&#x27; instead of &#x27;source/encrypted&#x27; [[ff3867a](https://github.com/guanghechen/node-scaffolds/commit/ff3867a57349f1bb4d3941512dcb132e72fb1d8c)]
- 🎨 refactor @guanghechen/helper-cipher-file [[002d3db](https://github.com/guanghechen/node-scaffolds/commit/002d3dbe2fa4526fbdb32d343e8b9f39205fc460)]
- 🎨 improve(helper-func): prefer Iterable instead of ReadonlyArray [[4492c24](https://github.com/guanghechen/node-scaffolds/commit/4492c249cab76f26ad0a1565c37d7e50860c4e09)]
- 🎨 improve(helper-cipher-file): export &#x27;filepath&#x27; from JsonConfigKeeper [[a129af3](https://github.com/guanghechen/node-scaffolds/commit/a129af3d03f36036425c943f0e8d558d2a2714ca)]
- 🎨 improve(helper-git): reformat codes &amp; update tests [[12b64ce](https://github.com/guanghechen/node-scaffolds/commit/12b64ce552af02ad9caae1d61af4593c7b37372b)]
- 🎨 improve: update eslint configs [[516c2b7](https://github.com/guanghechen/node-scaffolds/commit/516c2b74f48d5061972985abcac76ff2eb990dd7)]
- 🎨 refactor @guanghechen/helper-git [[9b35b48](https://github.com/guanghechen/node-scaffolds/commit/9b35b48ad4e0165839d17fb4b3aeaeebbfd23ec3)]
- 🎨 improve(@guanghechen/rollup-plugin-copy): use @guanghechen/helper-is instead of is-plain-object [[0316dce](https://github.com/guanghechen/node-scaffolds/commit/0316dceb8d06016ef1979a24a52f30efd7c456bb)]
- ⬆️ chore: upgrade devDependencies [[325e12d](https://github.com/guanghechen/node-scaffolds/commit/325e12d78a76d205ad82a1c8a6758a34df404c34)]
- 🎨 improve: rewrite @guanghechen/jest-config in typescript [[06e8e87](https://github.com/guanghechen/node-scaffolds/commit/06e8e873efc0b9db03cb694dd63e4f3e00b08048)]
- 🔧 chore: fix test coverage [[a8d2b35](https://github.com/guanghechen/node-scaffolds/commit/a8d2b35630d8bd8a57fa6a0414ba2b6f7e4896f6)]
- ⬆️ chore: upgrade dependencies [[f72ecb0](https://github.com/guanghechen/node-scaffolds/commit/f72ecb02a5c74f791c465aefacf11fe24e2fa1e2)]
- 🎨 rename CipherPathResolver to FileCIpherPathResolver [[9664d2a](https://github.com/guanghechen/node-scaffolds/commit/9664d2ad3ac621386c87c0b70800015f7d530d48)]
- 🎨 improve(chalk-logger): set header default delimiter colors to grey [[898643a](https://github.com/guanghechen/node-scaffolds/commit/898643a8c3d91394e7842a85911a2a0a0de7fdb8)]
- 🔧 chore: fix devDependencies [[bf8118f](https://github.com/guanghechen/node-scaffolds/commit/bf8118f524bc9a7a953c83152c4a0fb0507af13d)]
- ⬆️ chore: upgrade devDependencies [[5abb430](https://github.com/guanghechen/node-scaffolds/commit/5abb430a3b59da5ab02c2b55cc30cc46e6a627b5)]
- 🎨 improve: prefer built-in module node:fs/promises instead of fs-extra [[4a525b4](https://github.com/guanghechen/node-scaffolds/commit/4a525b457c8ddc4420d9e68b4f48ac4c1a2957f7)]
- 🎨 improve: prefer built-in module node:fs/promises instead of fs-extra [[591c45a](https://github.com/guanghechen/node-scaffolds/commit/591c45a6fec2a3707f80cb2716d542c5132176c6)]
- 🎨 refactor(helper-cipher): rearrange files [[df33b9c](https://github.com/guanghechen/node-scaffolds/commit/df33b9cafc1018339fdafaa3fd867283485f61c7)]
- 🎨 refactor Cipher &amp; fix build errors [[2e8cb0d](https://github.com/guanghechen/node-scaffolds/commit/2e8cb0df1838ba674ef5bd03390d8ac3e311aff7)]
- 🎨 improve: refactor helper-cipher [[a1c4a86](https://github.com/guanghechen/node-scaffolds/commit/a1c4a86f02dad68bb7dd871c89928a258c1bf9d6)]
- 🎨 improve: rename AESCipher to AesCipher [[fb5991e](https://github.com/guanghechen/node-scaffolds/commit/fb5991e3d102665d67cfccaf2522909d0b0dfabf)]
- 🎨 improve(helper-cipher): add diffFileCipherItems [[29bed39](https://github.com/guanghechen/node-scaffolds/commit/29bed397dd20c23b37ae09a47e83c4e73cbc8556)]
- 🎨 improve(helper-file): narrow types [[36dd01b](https://github.com/guanghechen/node-scaffolds/commit/36dd01bf91628d46c67b55c4cbd489ba0ac2aafb)]
- 🎨 refactor(helper-file): extract calcFilePartNames from BigFileHelper [[f8758b3](https://github.com/guanghechen/node-scaffolds/commit/f8758b3de0042932cf82142ed4b2d17fda194a91)]
- 🎨 improve: make code clean [[917a85d](https://github.com/guanghechen/node-scaffolds/commit/917a85d3067f5c14bb89b6a25b84441be9b5b939)]
- 🎨 refactor: abstract path resolver to CipherPathResolver [[b7c2ead](https://github.com/guanghechen/node-scaffolds/commit/b7c2ead8bdfb8b6f8c08bde68dbeec5ec16be08a)]
- 🎨 refactor @guanghechen/helper-cipher [[abfc81f](https://github.com/guanghechen/node-scaffolds/commit/abfc81f9d7e8980c948141490d01b060f55e06a9)]

### Removed

- 🔥 remove @guanghechen/helper-blob (migrated to @guanghechen/dom-blob) [[053fcc9](https://github.com/guanghechen/node-scaffolds/commit/053fcc93bf669d5c1094cc17dd5f0ee1ca09d0cb)]

### Fixed

- 🐛 fix(helper-git): use utc time to avoid diffent commit ID [[f0e1423](https://github.com/guanghechen/node-scaffolds/commit/f0e14236bbf3307da12892bace583db90958c982)]
- 🐛 fix(tool-git-cipher): refactor &amp; fix build error [[266bdcf](https://github.com/guanghechen/node-scaffolds/commit/266bdcff79a5c20d84aa8843ceeac39260ce9a01)]
- 🐛 fix(helper-cipher-file): raise error when detect unepxected cases in &#x27;diffFromPlainFiles&#x27; [[c372639](https://github.com/guanghechen/node-scaffolds/commit/c3726398c1a05f7b9296463ef5480e06a41b67f5)]
- 🐛 fix(helper-file): should always use &#x60;undefined&#x60; encoding to get raw buffer instead of any pretreated data [[53ba810](https://github.com/guanghechen/node-scaffolds/commit/53ba81011213f0955444477d7e4683be6452b961)]
- 🐛 fix: use relative path in catalog items [[ae1319b](https://github.com/guanghechen/node-scaffolds/commit/ae1319bf0ae7abeb8cad6ac93baf6e2dcbff5f7b)]

### Miscellaneous

- 📝 docs: update doc url [[c99c7f8](https://github.com/guanghechen/node-scaffolds/commit/c99c7f8849dc96e800d0fd166ac8fe748b1356f0)]
- 📝 docs: update READMEs [[0b4c1af](https://github.com/guanghechen/node-scaffolds/commit/0b4c1af9b834bfb6acdef0510556ec9ce7b8992d)]
-  [BREAKING] improve: use pbkdf2 to generate key from password &amp; update tests [[15d0199](https://github.com/guanghechen/node-scaffolds/commit/15d019950e2c734ff93fe4559e1186a45a5157b6)]
-  [BREAKING] improve: prefer fileSize instead of a filepath in calcFilePartItemsBySize and calcFilePartItemsByCount [[9412c29](https://github.com/guanghechen/node-scaffolds/commit/9412c2951f475cb7f26913d6570e04d504879034)]
-  improve: fix dependencies [[b965f32](https://github.com/guanghechen/node-scaffolds/commit/b965f32ee622eaa98a81a3dd22adb8a856966540)]
- 📝 docs: update README [[1456c16](https://github.com/guanghechen/node-scaffolds/commit/1456c16526ac2349b21bec963dcd213428df6967)]


<a name="3.0.2"></a>
## 3.0.2 (2023-01-14)

### Changed

- 🔧 chore: fix rollup configs [[3d71b5e](https://github.com/guanghechen/node-scaffolds/commit/3d71b5eec5568f9f48875ca4bc86b82e54ecdc77)]


<a name="3.0.1"></a>
## 3.0.1 (2023-01-14)

### Changed

- 🔧 chore: fix github action [[487dbda](https://github.com/guanghechen/node-scaffolds/commit/487dbda7c7d5b404b6859684883085d31487aacd)]
- 🔧 chore: fix rollup configs [[c548d13](https://github.com/guanghechen/node-scaffolds/commit/c548d136030fdfadfdbaf79d2fe613b00370dfd0)]
- ⬆️ chore: upgrade devDependencies [[2993a46](https://github.com/guanghechen/node-scaffolds/commit/2993a46e3665c7cfb23858f44812498cb2f39573)]
- 🔧 chore: fix lint [[0f960e7](https://github.com/guanghechen/node-scaffolds/commit/0f960e78ddad31258115de35555d135813ca7587)]
- 🔧 chore: fix rollup.config.cli [[26201e8](https://github.com/guanghechen/node-scaffolds/commit/26201e87ffc64333b9d5a4aa32148a46280a0489)]


<a name="3.0.0"></a>
## 3.0.0 (2023-01-09)

### Changed

- 🔧 chore: update yarn.lock when publish new release [[a0fb68e](https://github.com/guanghechen/node-scaffolds/commit/a0fb68e4d364d2c0fd6f0e75c2494729810a424d)]
- 🔧 chore: update configs [[cfe1f32](https://github.com/guanghechen/node-scaffolds/commit/cfe1f328eeb0ac2c2318b8732f524e8bb1936b21)]


<a name="3.0.0-alpha.5"></a>
## 3.0.0-alpha.5 (2023-01-05)

### Fixed

- 🐛 fix jest-config within esm [[4050e62](https://github.com/guanghechen/node-scaffolds/commit/4050e629536ae003c99ef9eeafa59c8aa8e1f0b3)]

### Miscellaneous

-  fix typos [[3089e04](https://github.com/guanghechen/node-scaffolds/commit/3089e04f8ac6ec1450ee514850aaa51031e752a5)]


<a name="3.0.0-alpha.4"></a>
## 3.0.0-alpha.4 (2023-01-04)

### Changed

- 🔧 fix commonjs entry [[259e185](https://github.com/guanghechen/node-scaffolds/commit/259e185ee811cebc4cf9b41d8c27c937460ef6d4)]


<a name="3.0.0-alpha.3"></a>
## 3.0.0-alpha.3 (2023-01-04)

### Changed

- 🔧 chore: update npm script [[a03b921](https://github.com/guanghechen/node-scaffolds/commit/a03b9213b995235033a01c15df4e69ba2c97a494)]
- 🔧 chore: support dual esm/commonjs packages [[90363f5](https://github.com/guanghechen/node-scaffolds/commit/90363f585471b527063133dedb1dff50d8b2a890)]


<a name="3.0.0-alpha.2"></a>
## 3.0.0-alpha.2 (2023-01-02)

### Changed

- 🔧 [BREAKING] chore: support ESM only [[29b8c42](https://github.com/guanghechen/node-scaffolds/commit/29b8c421c0a2dfdd04cf4d7ff3ef0e5a93d70e16)]
- 🔧 chore: update jest config [[23cef86](https://github.com/guanghechen/node-scaffolds/commit/23cef861460dc04c584101165cef4a55f0dd4a36)]

### Fixed

- 💚 chore: fix ci [[b9da1d9](https://github.com/guanghechen/node-scaffolds/commit/b9da1d9f30bc8d54d59c4a596375ea9c510574d8)]
- 💚 chore: fix ci [[d44a14d](https://github.com/guanghechen/node-scaffolds/commit/d44a14d44d0e5c42e5f73db0aab8bfa764ac3d9a)]


<a name="3.0.0-alpha.1"></a>
## 3.0.0-alpha.1 (2023-01-02)

### Changed

- 🔧 chore: fix test configuration [[49b7beb](https://github.com/guanghechen/node-scaffolds/commit/49b7beb45e1d910927d2dda2c571861a7b86ae88)]
- 🔧 chore: update npm script [[135e89d](https://github.com/guanghechen/node-scaffolds/commit/135e89d8a0b34dd34bb6af2037d6de58002bfa1f)]
- ⬆️ chore: use yarn@3 [[cd388d0](https://github.com/guanghechen/node-scaffolds/commit/cd388d0453849401b034bf4992c679adf802e989)]

### Fixed

- 💚 chore: fix ci configurations [[2e5ea68](https://github.com/guanghechen/node-scaffolds/commit/2e5ea68299dc1747f7ce980f4351d47abfaabbe0)]


<a name="3.0.0-alpha.0"></a>
## 3.0.0-alpha.0 (2022-12-31)

### Added

- ✅ test: fix test snapshot [[16a6973](https://github.com/guanghechen/node-scaffolds/commit/16a6973dbbdd9fe0007d216f83e0edc014dd3ee1)]
- ✨ [BREAKING] improve(helper-npm) support ESM format only [[645060f](https://github.com/guanghechen/node-scaffolds/commit/645060faf63a5eadc8255272aba52e8eb411ba39)]
- ✨ [BREAKING] improve(tool-git-cipher) support ESM format only [[50493f0](https://github.com/guanghechen/node-scaffolds/commit/50493f00b9be258b3fd409d1b6dc35a24f7e2400)]
- ✨ [BREAKING] improve(tool-mini-copy) support ESM format only [[172bc9c](https://github.com/guanghechen/node-scaffolds/commit/172bc9cd110a000a8f0d6a71700c48998f44ade0)]
- ✨ [BREAKING] improve(postcss-modules-dts): support ESM format only [[c946dd6](https://github.com/guanghechen/node-scaffolds/commit/c946dd65ba12b487b7da91f897a3d4260f6e5a0d)]
- ✨ [BREAKING] improve(mini-copy): support ESM format only [[8cb0e74](https://github.com/guanghechen/node-scaffolds/commit/8cb0e74ff1065e9c212381d6e8a7e9628b5f3eff)]
- ✨ [BREAKING] improve(helper-commander): support ESM format only [[7b6e6a4](https://github.com/guanghechen/node-scaffolds/commit/7b6e6a482f4f5595b7fa11c0d27a8def0689e1a8)]
- ✨ [BREAKING] improve(helper-plop): support ESM format only [[9287b78](https://github.com/guanghechen/node-scaffolds/commit/9287b789a4c10c36ca9086802d3ccecf33b1e752)]
- ✨ [BREAKING] improve(chalk-logger): support ESM format only [[2e3bd66](https://github.com/guanghechen/node-scaffolds/commit/2e3bd668b3718a3aa85c3289eea3b3d1744bf915)]
- ✨ fix(helper-jest,jest-config): support ESM [[905ba17](https://github.com/guanghechen/node-scaffolds/commit/905ba17e312a606272d9cd4d69094baae3b99ffd)]
- ✨ [BREAKING] feat(rollup-config-*): support esm format only [[3f3077a](https://github.com/guanghechen/node-scaffolds/commit/3f3077abe1ac00e894ccc5660af0186622951180)]
- ✨ [BREAKING] feat: upgrade to rollup@3 &amp; support esm only [[3a21557](https://github.com/guanghechen/node-scaffolds/commit/3a2155716dd23956eb808d5da9aa874e06ef0d3c)]
- ✅ test fix test in macos [[daaee11](https://github.com/guanghechen/node-scaffolds/commit/daaee11b55b02b175b7790f3af9bf3e34a5a682b)]

### Changed

- 🔧 chore: fix cli build script [[d4f96fe](https://github.com/guanghechen/node-scaffolds/commit/d4f96fe618f5153f0d9611b652b224367ec0d172)]
- 🔧 chore: update yarn.lock [[cfb8e31](https://github.com/guanghechen/node-scaffolds/commit/cfb8e31c4313ca08e84c1a543931d7945bb7e073)]
- ⬆️ chore: upgrade dependencies &amp; fix missing dependencies [[c96fd71](https://github.com/guanghechen/node-scaffolds/commit/c96fd719c8b482224119a677de2a4bde7c3f2021)]
- ⬆️ chore(rollup-config-tsx): upgrade dependencies [[66e969d](https://github.com/guanghechen/node-scaffolds/commit/66e969d751899f5b3e9b55b940262848a7d5a7b8)]
- 🎨 improve: use new method to calculate __dirname [[e3011e7](https://github.com/guanghechen/node-scaffolds/commit/e3011e7c5fa23a11bd5d6bf8c39643d25522343b)]
- ⬆️ chore(rollup-plugin-copy): upgrade dependencies [[2382160](https://github.com/guanghechen/node-scaffolds/commit/2382160af0e3e0ed3fe5778a6c2e2add86222e9c)]
- 🔧 chore: fix test [[6f911d4](https://github.com/guanghechen/node-scaffolds/commit/6f911d421240af2f17e6283bc4cbd53a32ac3bdc)]
- 🎨 improve: avoid to depend on fs-extra [[3347f2d](https://github.com/guanghechen/node-scaffolds/commit/3347f2d07b465d79a0f7aecf69f8f4566125152f)]
- 🔧 chore: fix build scripts [[b24918c](https://github.com/guanghechen/node-scaffolds/commit/b24918c278188a043f7aabfc30739fa97d5ad060)]
- ⬆️ chore: upgrade dependencies [[153b071](https://github.com/guanghechen/node-scaffolds/commit/153b0716984742fe70f20d22903b14e85e9d14aa)]

### Fixed

- 🐛 fix(jest-config): support importAssertions in coverage [[47887f2](https://github.com/guanghechen/node-scaffolds/commit/47887f2b3b57ac3905723905abde81512075ef90)]
- 🐛 test: fix colors in macos [[0c88fcc](https://github.com/guanghechen/node-scaffolds/commit/0c88fcc28ea0c483cd4f0a307037014a3e483b50)]

### Miscellaneous

- 📝 doc: update link for v3.x.x [[f39886b](https://github.com/guanghechen/node-scaffolds/commit/f39886b5568ad9ba3d9e09bc56947725c363c5f3)]
-  fix types [[9d75fb2](https://github.com/guanghechen/node-scaffolds/commit/9d75fb26aba609f05772b136d49819d2ba73c3ee)]
-  fix lint [[a2eac72](https://github.com/guanghechen/node-scaffolds/commit/a2eac7293a27e2197092e60453031a62a205f1d8)]


<a name="2.1.4"></a>
## 2.1.4 (2022-11-03)

### Changed

- 🚚 migrate @guanghechen/parse-lineno to react-kit [[7ff6352](https://github.com/guanghechen/node-scaffolds/commit/7ff6352a7836568bd50fe4da0a79b7217bcc3ec3)]

### Miscellaneous

- 📄 docs: update LICENSE [[f615fb0](https://github.com/guanghechen/node-scaffolds/commit/f615fb06a9efa7df3b29031b72f1a84f7f9bafd1)]


<a name="2.1.3"></a>
## 2.1.3 (2022-11-03)

### Changed

- 🔧 chore: update devDependencies [[91b6421](https://github.com/guanghechen/node-scaffolds/commit/91b6421aee991d4151cb28c90bd45397ceb912ed)]
- 🚚 migrate @guanghechen/react-hooks to react-kit [[058d201](https://github.com/guanghechen/node-scaffolds/commit/058d201aace76fd96b3fa868f84ffb25869da9bf)]


<a name="2.1.2"></a>
## 2.1.2 (2022-10-20)

### Added

- ✅ test: update test [[eaf8b3f](https://github.com/guanghechen/node-scaffolds/commit/eaf8b3f5f43c7c8038fbebeda0110c247204b7a1)]

### Changed

- 🔧 chore: declare compatibility of rollup-plugin-copy with rollup v3 [[0639cd0](https://github.com/guanghechen/node-scaffolds/commit/0639cd017328d39615d91bc5953d6403b3a80b5b)]
- 🔧 chore: update .nvmrc [[8c8795f](https://github.com/guanghechen/node-scaffolds/commit/8c8795f440bb1e45c8cad72c9cb85882444683a3)]

### Fixed

- 💚 chore: fix test [[e77633c](https://github.com/guanghechen/node-scaffolds/commit/e77633cd892c2e25635cc2f8bf4b6d0635f729ff)]
- 💚 chore: fix issues by wrong &#x27;path.resolve()&#x27; returned in Github Workflow [[2d6ae22](https://github.com/guanghechen/node-scaffolds/commit/2d6ae2209d3f63eb4c0a60e86d8a1dd4531459fb)]
- 💚 chore: fix ci configuration [[c65e2ec](https://github.com/guanghechen/node-scaffolds/commit/c65e2ec6ff7c48aaa7c73f39c3949566e6041ba6)]

### Miscellaneous

-  Merge pull request [#5](https://github.com/guanghechen/node-scaffolds/issues/5) from ghost91-/rollup-3 [[f35ea91](https://github.com/guanghechen/node-scaffolds/commit/f35ea914f5cc2524437fef8b97cbbb2285e9dbf2)]


<a name="2.1.1"></a>
## 2.1.1 (2022-10-13)

### Changed

- 🔧 chore: fix test coverage [[93a8c96](https://github.com/guanghechen/node-scaffolds/commit/93a8c96e1b1d572517c92b14331f8502c46db29e)]
- 🎨 improve: make code tidy [[bfd11ec](https://github.com/guanghechen/node-scaffolds/commit/bfd11ece3b84028e6d7a078aab4ce865218473e1)]
- 🔧 chore: fix build scripts [[b97eea2](https://github.com/guanghechen/node-scaffolds/commit/b97eea2b001b16616f0899faac6319c500c092d3)]
- 🔧 chore: tweak peerDependencies [[a95956c](https://github.com/guanghechen/node-scaffolds/commit/a95956ca3bdfb244c115365cbe2d892689b788f2)]
- 🎨 improve: refactor helper-commander [[6847770](https://github.com/guanghechen/node-scaffolds/commit/68477700fb4aeb52a20a5b72370f2f54f4fadda5)]
- 🚨 style: fix lint [[af26dbc](https://github.com/guanghechen/node-scaffolds/commit/af26dbc23201895cdccee51d71512d837042713d)]
- 🎨 improve: refactor helper-commander [[9bf92e5](https://github.com/guanghechen/node-scaffolds/commit/9bf92e590e3f79e2153ab4c9d3613851569950b1)]
- 🎨 improve: prefer shorter types [[e757afc](https://github.com/guanghechen/node-scaffolds/commit/e757afc5683d691cce1aa32a1fc3efaa6f6d5376)]
- 🎨 improve(rollup-config-tsx): prefer types provided by author [[23ad9f6](https://github.com/guanghechen/node-scaffolds/commit/23ad9f6f6179f5fd2c0a291eee423971a6cb0686)]
- ⬆️ chore: upgrade dependencies [[8c47919](https://github.com/guanghechen/node-scaffolds/commit/8c479197fea14be59e995bb05e5c134097ab4f7f)]

### Miscellaneous

- 📝 docs: fix invalid links [[e20f2d6](https://github.com/guanghechen/node-scaffolds/commit/e20f2d625fc7fa0724fbd0bcc6ea04d4cba24909)]


<a name="2.1.0"></a>
## 2.1.0 (2022-09-18)

### Changed

- ⬆️ chore: ugprade jest to v29.x.x &amp; update jest-config [[d54145c](https://github.com/guanghechen/node-scaffolds/commit/d54145ce1e8b59780828a259ed6ddca6aa6e6b5f)]


<a name="2.0.0"></a>
## 2.0.0 (2022-09-17)

### Added

- ✅ test: fix test [[4a39ef8](https://github.com/guanghechen/node-scaffolds/commit/4a39ef83035ce3a65fdd5bc36f5f57869fef456d)]
- ✨ feat(helper-is): export new util method &#x60;isPromise&#x60; [[f827d68](https://github.com/guanghechen/node-scaffolds/commit/f827d68514985b2f4821818e5e22f73994be512e)]

### Changed

- 🔧 chore: support node &gt;&#x3D; 16 [[208522b](https://github.com/guanghechen/node-scaffolds/commit/208522b6a7f8eba53a2562595706b25d63e91c29)]
- 🔧 chore: upgrade dependencies [[2814cbf](https://github.com/guanghechen/node-scaffolds/commit/2814cbfa4d4461f064c431f4c0bebefeefbbfd5a)]
- 🚨 fix lint warnings [[67584dc](https://github.com/guanghechen/node-scaffolds/commit/67584dc886d759aad51232472fe141bf35d9c3c9)]

### Miscellaneous

- 📝 docs: update READMEs [[d6743d2](https://github.com/guanghechen/node-scaffolds/commit/d6743d24c94ea6c7a24ff4a2dc48113a2c2f96ce)]


<a name="2.0.0-alpha.3"></a>
## 2.0.0-alpha.3 (2022-09-15)

### Changed

- 🚚 move some filepath relative methods from @algorithm.ts/helper-file to @algorithm/helper-path [[1da75c9](https://github.com/guanghechen/node-scaffolds/commit/1da75c9901b828d7b477b8c24f5dda483d3c1e3e)]


<a name="2.0.0-alpha.2"></a>
## 2.0.0-alpha.2 (2022-08-27)

### Added

- ✨ feat(rollup-config): support dtsOptions [[8772a4f](https://github.com/guanghechen/node-scaffolds/commit/8772a4f0e025931fa502ab8f2d0804b81b0994c7)]
- ✅ test: update test snapshots [[104a8ab](https://github.com/guanghechen/node-scaffolds/commit/104a8ab2f97455a51afc0024f39dd22c13f921ad)]
- ✨ feat(rollup-config): bundle *.d.ts into a single file [[080eaf9](https://github.com/guanghechen/node-scaffolds/commit/080eaf9ffd250b9de4c33a7dacc4922c91d9bc02)]

### Changed

- 🔧 chore: fix build error [[4d6704a](https://github.com/guanghechen/node-scaffolds/commit/4d6704a47106d3d2b070bfbaaf83ecefbd5e5877)]
- 🔧 chore: update build configs [[1770796](https://github.com/guanghechen/node-scaffolds/commit/177079603d8884e550cbc015f691f13939da056e)]
- 👽 fix: fix errors due to the breaking change on @guanghechen/rollup-config [[58bc306](https://github.com/guanghechen/node-scaffolds/commit/58bc306a76fab835dc47f0d4594979c9b707f57f)]
- ⬆️ chore: upgrade dependencies [[95b413e](https://github.com/guanghechen/node-scaffolds/commit/95b413ec4884f41a6a4f8b422ced45f38df572e2)]


<a name="2.0.0-alpha.1"></a>
## 2.0.0-alpha.1 (2022-08-13)

### Fixed

- 🐛 fix(helper-is): AsyncFunction is also regarded as Function type [[24535e5](https://github.com/guanghechen/node-scaffolds/commit/24535e598f1687207a184ccdd476e1e75f8c329a)]


<a name="2.0.0-alpha.0"></a>
## 2.0.0-alpha.0 (2022-08-05)

### Added

- ✅ test: update tests [[89590ea](https://github.com/guanghechen/node-scaffolds/commit/89590ea7daae87e37740f0ffcf3ecf964bb49cda)]
- ✨ feat: abstract stream utilities to @guanghechen/helper-stream [[921396f](https://github.com/guanghechen/node-scaffolds/commit/921396fa5e922d3c308d04840cdbf5d5c5b2b700)]
- ✅ test: fix tests [[d4d9436](https://github.com/guanghechen/node-scaffolds/commit/d4d9436862b07d972313fed06de302f56a7133ae)]
- ✨ feat: abstract path related funcs to @guanghechen/helper-path [[7ef05a2](https://github.com/guanghechen/node-scaffolds/commit/7ef05a227fe06368936f33964208cb90fbc236ca)]
- ✨ feat: abstract utils func to @guanghechen/helper-func [[8de8591](https://github.com/guanghechen/node-scaffolds/commit/8de8591053d2ce67f9fa5961f0b0bd3ffdfcf76b)]
- ✨ feat: abstract type-detect utilities from @guanghechen/option-helper to @guanghechen/helper-is [[8fd92ea](https://github.com/guanghechen/node-scaffolds/commit/8fd92ea728302954617585a0ae6121181045eecf)]
- ✨ feat: abstract string related utilities to @guanghechen/helper-string [[95069dd](https://github.com/guanghechen/node-scaffolds/commit/95069dd977f87f3849b5f551f683c9aad3d57359)]

### Changed

- 🔧 chore: update npm scripts [[d285087](https://github.com/guanghechen/node-scaffolds/commit/d285087000057d9dda483a8cae90c118305f12e2)]
- 🔧 chore: update yarn.lock [[4c6e0c7](https://github.com/guanghechen/node-scaffolds/commit/4c6e0c7e54ca4782fb8debd201dc1b29d4c16ac5)]
- 🎨 improve(rollup-config): remove unnecessary dependencies [[0858483](https://github.com/guanghechen/node-scaffolds/commit/085848353611b7603d702e0ce010069fef81548b)]
- 🔧 chore: modify build script [[4234bc0](https://github.com/guanghechen/node-scaffolds/commit/4234bc058bd9ade25778cb43ee5db939d8e630a9)]
- 🎨 style: tweak @guanghechen/helper-string [[ce6a36b](https://github.com/guanghechen/node-scaffolds/commit/ce6a36b4d13f7ecb876b12a9083d517cbad6f234)]
- 🔧 chore: update .prettierrc [[727b2d8](https://github.com/guanghechen/node-scaffolds/commit/727b2d830523c101630b25d52e7ce3f68ccf864d)]
- 👽 fix: fix invalid imports due to the breaking changes of option-helper [[a12a3d3](https://github.com/guanghechen/node-scaffolds/commit/a12a3d3b11df1fc9c3a5888357956b2680ce8c25)]
- ⬆️ chore: upgrade dependencies [[8af8918](https://github.com/guanghechen/node-scaffolds/commit/8af89184d7cda5e90c882ffc2b8684ebacf82887)]

### Breaking changes

- 💥 art: refactor @guanghechen/chalk-logger [[7d8c62a](https://github.com/guanghechen/node-scaffolds/commit/7d8c62a2efe6f1c907be0a75b74913da98fac27c)]
- 💥 rename: rename @guanghechen/jest-helper to @guanghechen/helper-jest [[8545bc2](https://github.com/guanghechen/node-scaffolds/commit/8545bc27992418b69a78106d1ba3d65c31486314)]
- 💥 rename: rename @guanghechen/commander-helper to @guanghechen/helper-commander [[9f42244](https://github.com/guanghechen/node-scaffolds/commit/9f422444af5087d539a0f733b96bd64ad03198e7)]
- 💥 rename: rename @guanghechen/plop-helper to @guanghechen/helper-plop [[91e0ccf](https://github.com/guanghechen/node-scaffolds/commit/91e0ccfb852204c53d257c4cf3ab3dc8ab3f1c32)]
- 💥 refactor: move codes from @guanghechen/locate-helper to @guanghechen/helper-path [[fb284ff](https://github.com/guanghechen/node-scaffolds/commit/fb284ffe163eac0831db1f244713eb3365b3182f)]
- 💥 rename: rename @guanghechen/npm-helper to @guanghechen/helper-npm [[f07616f](https://github.com/guanghechen/node-scaffolds/commit/f07616f05420fb9dcba87f2860e5c1a908048417)]
- 💥 rename: rename @guanghechen/cipher-helper to @guanghechen/helper-cipher [[bdec66d](https://github.com/guanghechen/node-scaffolds/commit/bdec66d9863fd688b696b01210bbd178feb91c9f)]
- 💥 rename: rename @guanghehcen/file-helper to @guanghechen/helper-file [[2859ff4](https://github.com/guanghechen/node-scaffolds/commit/2859ff4ebf307188d6bf59b0fcb6c1d52f785a28)]
- 💥 refactor: refactor event-bus [[3d41ccd](https://github.com/guanghechen/node-scaffolds/commit/3d41ccdf5e1773508869f988a7e02aafb1167a4e)]
- 💥 rename: rename @guanghechen/blob-helper to @guanghechen/helper-blob [[6e80f76](https://github.com/guanghechen/node-scaffolds/commit/6e80f76f4e19b6a3c58dae2df7cf01ab77cd4194)]
- 💥 rename: rename @guanghechen/option-helper to @guanghechen/helper-option [[cdf9aad](https://github.com/guanghechen/node-scaffolds/commit/cdf9aad7928bd317d2d9f39c43a834409746e235)]
- 💥 improve(chalk-logger): add  prefix for types [[f634c57](https://github.com/guanghechen/node-scaffolds/commit/f634c57f578c49144aab70835f54e4ff91ba41e3)]

### Removed

- 🔥️ remove package @guanghechen/template-ts-package and @guanghechen/template-tsx-package [[a80c4c8](https://github.com/guanghechen/node-scaffolds/commit/a80c4c80fd257c4cd887e580089f9d24ec84d576)]
- 🔥 remove package @guanghechen/redux-actions [[be87176](https://github.com/guanghechen/node-scaffolds/commit/be871769c88f9511e124f6f35d94b15aae38807f)]


<a name="1.9.8"></a>
## 1.9.8 (2022-07-27)

### Added

- ✨ feat(tool-mini-copy): support new option &#x27;--strip-ansi&#x27; to strip ansi escape codes from input contents [[75062f2](https://github.com/guanghechen/node-scaffolds/commit/75062f2cf763472d139412307ac9d19f8893021b)]

### Changed

- 🎨 improve: refactor codes &amp; fix bugs [[c388e53](https://github.com/guanghechen/node-scaffolds/commit/c388e53b4234971fa92297fb2147815b0e7a3626)]
- 🎨 improve: provde customized strip-ansi to avoid esm issues [[d362cd1](https://github.com/guanghechen/node-scaffolds/commit/d362cd1b47d2bb1a3fa5c359c72cc17fd97625a6)]

### Miscellaneous

- 📝 docs: update README [[0cabb7d](https://github.com/guanghechen/node-scaffolds/commit/0cabb7d95a1cc9028e2b76c59f9affab47057659)]
- 📝 docs(README): fix invalid urls [[e03b62a](https://github.com/guanghechen/node-scaffolds/commit/e03b62a9edbb281100eb26d601c903744e273ccd)]


<a name="1.9.7"></a>
## 1.9.7 (2022-07-17)

### Added

- ✅ test: update test snapshots [[5d559a6](https://github.com/guanghechen/node-scaffolds/commit/5d559a605bec5a09b6fb5fd6c91cb915f793dcc1)]
- ✨ feat: add @guanghechen/tool-mini-copy (migrated from https://github.com/lemon-clown/mini-copy-cli) [[794dcdd](https://github.com/guanghechen/node-scaffolds/commit/794dcddfd8aadfaf95a8c1b6ff24e972645d7192)]
- ✨ feat: add @guanghechen/mini-copy (migrated from https://github.com/lemon-clown/mini-copy) [[cfc3c6d](https://github.com/guanghechen/node-scaffolds/commit/cfc3c6d2cb62292da50bbf277a0485956874182b)]

### Changed

- ⬆️ chore: upgrade devDependencies [[d5c2635](https://github.com/guanghechen/node-scaffolds/commit/d5c26356ef7ab4e28c2f3ea7bf617f1434806ccd)]
- 🚨 style: fix lint [[806cd09](https://github.com/guanghechen/node-scaffolds/commit/806cd09d31d6a24f1761d6a208baa4dac14d5471)]
- 🎨 feat(option-helper): add util func: &#x27;isArrayOfT&#x27; and &#x27;isTwoDimensionArrayOfT&#x27; [[1182098](https://github.com/guanghechen/node-scaffolds/commit/11820986145a76897eb67c9867d5205517657da8)]
- ⬆️ chore: upgrade dependencies [[b889df2](https://github.com/guanghechen/node-scaffolds/commit/b889df299aaea87fe5601fe3e47bfa8a5980ab97)]
- 🎨 refactor: rename useEvent to useEventCallback &amp; init the handlerRef on first call [[f7e583e](https://github.com/guanghechen/node-scaffolds/commit/f7e583eabbdcf40fcc19a352a8941655efa68dab)]
- 🎨 style: format demo codes [[59d1307](https://github.com/guanghechen/node-scaffolds/commit/59d1307e32abd024ede6421b582f31f4452e3b19)]

### Fixed

- 🐛 fix known issues [[d9cbc76](https://github.com/guanghechen/node-scaffolds/commit/d9cbc767966471be3ff4034421eacb494b562853)]

### Miscellaneous

- 📝 docs: update README [[d28b106](https://github.com/guanghechen/node-scaffolds/commit/d28b1068986a73cfec2f5d75aacfdbce062ff3e5)]
-  mod(mini-copy): throw error if copy/paste failed [[ecccc27](https://github.com/guanghechen/node-scaffolds/commit/ecccc27b896249d6707d237c713ee90790230791)]


<a name="1.9.5"></a>
## 1.9.5 (2022-06-03)

### Added

- ✨ feat(react-hooks): add useEvent and useSyncState [[f648260](https://github.com/guanghechen/node-scaffolds/commit/f64826073cb52c697c5ee50e9686dc36804dd23c)]

### Changed

- 🎨 improve: update eslint config [[cca8085](https://github.com/guanghechen/node-scaffolds/commit/cca808571d10162d8f9a7f87b2a297cd63cb8237)]
- ⬆️ chore: upgrade dependencies [[cbf674c](https://github.com/guanghechen/node-scaffolds/commit/cbf674c8ab55e73a53860e4b212db9ef08a48045)]


<a name="1.9.4"></a>
## 1.9.4 (2022-04-27)

### Changed

- 🎨 improve(rollup-plugin-copy): pass source filepath instead of expanded filepath as the second parameter of &#x60;rename&#x60; [[79fc521](https://github.com/guanghechen/node-scaffolds/commit/79fc5214d657368cd82d787aead9c4750bc6ae8d)]
- 🔧 chore: rename jest.setup.ts to jest.helper.ts [[8a7e4f8](https://github.com/guanghechen/node-scaffolds/commit/8a7e4f887ccbbf393280d367d3c889e1a6123915)]
- ⬆️ chore: upgrade dependencies [[14d3696](https://github.com/guanghechen/node-scaffolds/commit/14d369674b752eb286cf57300bc4fa1159cb2972)]

### Miscellaneous

- 📝 docs(rollup-plugin-copy): update README [[6d3732a](https://github.com/guanghechen/node-scaffolds/commit/6d3732a108da8c8834f44987937be71e94d263c2)]


<a name="1.9.3"></a>
## 1.9.3 (2022-04-10)

### Added

- ✅ test: update snapshots [[baf1f91](https://github.com/guanghechen/node-scaffolds/commit/baf1f91acd6c59fcc6a6fc7f374ccd5d159d5988)]

### Changed

- ⬆️ chore: ugprade dependencies [[6595312](https://github.com/guanghechen/node-scaffolds/commit/6595312b147b599bed60218bd783ff0de4265361)]


<a name="1.9.2"></a>
## 1.9.2 (2022-03-12)

### Fixed

- 🐛 fix: useReactiveRef should always pointer to the latest referred value [[b0a3491](https://github.com/guanghechen/node-scaffolds/commit/b0a349138652d5234a5b3c0f5abb5a0412997908)]


<a name="1.9.1"></a>
## 1.9.1 (2022-02-23)

### Added

- ✅ test([#2](https://github.com/guanghechen/node-scaffolds/issues/2)): update tests [[5eb2db5](https://github.com/guanghechen/node-scaffolds/commit/5eb2db5b9da30b0ffdfaf5ce92380a4b079460b2)]
- ✨ feat([#2](https://github.com/guanghechen/node-scaffolds/issues/2)): support to preserve the source structure [[5c2e136](https://github.com/guanghechen/node-scaffolds/commit/5c2e136c793072c69c5ad7974640a754b4ed8b5b)]

### Changed

- 🍱 assets([#2](https://github.com/guanghechen/node-scaffolds/issues/2)): update demo assets [[2dd133c](https://github.com/guanghechen/node-scaffolds/commit/2dd133cd62cd64000277bbca00dfef7a80c905b8)]
- 🍱 asset([#2](https://github.com/guanghechen/node-scaffolds/issues/2)): update assets [[8767395](https://github.com/guanghechen/node-scaffolds/commit/87673955d66de3a2fae44b421b0be7d7d8aed1b7)]
- 🎨 improve: revert the new option &#x27;srcStructureRoot&#x27; [[71d0578](https://github.com/guanghechen/node-scaffolds/commit/71d05783f0a6b68eccc7d7f341b682cfa3e8c8fb)]
- 🍱 asset: update rollup config [[c03ce24](https://github.com/guanghechen/node-scaffolds/commit/c03ce241d0ba28d0a0ed08dfba1f6ae13dd92488)]
- 🍱 asset: additional examples in playground/rollup-plugin-copy [[0d1d720](https://github.com/guanghechen/node-scaffolds/commit/0d1d720bb3e1e93af4dfa2dadbddd9f8d6435a26)]

### Fixed

- 🐛 fix([#2](https://github.com/guanghechen/node-scaffolds/issues/2)): fix inconsistent behavior on build and watch mode when &#x27;rename&#x27; option is specified [[7d7038e](https://github.com/guanghechen/node-scaffolds/commit/7d7038e86d52ce162d5049fd882c76a8b06dc637)]
- 🐛 fix([#2](https://github.com/guanghechen/node-scaffolds/issues/2)): fix failed tests [[11c86e4](https://github.com/guanghechen/node-scaffolds/commit/11c86e4a8454738093f6a7592055b7965dd71a69)]
- 🐛 fix([#2](https://github.com/guanghechen/node-scaffolds/issues/2)): compatible with the previous behavior when &quot;flatten&quot; is set to &#x60;true&#x60; [[9868e95](https://github.com/guanghechen/node-scaffolds/commit/9868e955d5e35b68c210bcce14899b0743c0e38a)]
- 🐛 fix([#2](https://github.com/guanghechen/node-scaffolds/issues/2)): fix weird dest filepath when &#x27;flatten&#x27; is set to false [[2ee79f7](https://github.com/guanghechen/node-scaffolds/commit/2ee79f7c8c4f269919447d923be2e78a877d183f)]
- 🐛 fix([#2](https://github.com/guanghechen/node-scaffolds/issues/2)): use micromatch to match the glob patterns [[09e2237](https://github.com/guanghechen/node-scaffolds/commit/09e22379aff925afe4d27eb2164eb04fb4dc907c)]
- 🐛 fix([#2](https://github.com/guanghechen/node-scaffolds/issues/2)): fix weird behaviors [[48ef3a1](https://github.com/guanghechen/node-scaffolds/commit/48ef3a1ab20a839aaddf143dba835d78720aee53)]
- 🐛 fix([#2](https://github.com/guanghechen/node-scaffolds/issues/2)): try to expand the glob pattern to match the directories [[85e31e1](https://github.com/guanghechen/node-scaffolds/commit/85e31e10f9b8577c5560c2bcd75737061425898a)]

### Miscellaneous

- 📝 docs([#2](https://github.com/guanghechen/node-scaffolds/issues/2)): update README [[de9ad5c](https://github.com/guanghechen/node-scaffolds/commit/de9ad5c4dbbbb6f5d14efd90adc61a69a65fabea)]
-  Merge pull request [#3](https://github.com/guanghechen/node-scaffolds/issues/3) from ghost91-/main [[8af8363](https://github.com/guanghechen/node-scaffolds/commit/8af836375375c78ed2fd736064ba09db9f800b38)]


<a name="1.9.0"></a>
## 1.9.0 (2022-02-17)

### Changed

- 🍱 asset: update playground/rollup-plugin-copy [[9347501](https://github.com/guanghechen/node-scaffolds/commit/9347501a9f5e33602acf3a789275e94dcffd636d)]
- 🎨 imprvoe: set stabilityThreshold for awaitWriteFinish option [[a13c046](https://github.com/guanghechen/node-scaffolds/commit/a13c04668c590b6301b2f93ec780a9e486fde95f)]
- 🎨 improve: retry if the read operation is failed &amp; update tests [[d111446](https://github.com/guanghechen/node-scaffolds/commit/d11144684f22b14946d8920e5f2fed7823a915b1)]
- 🍱 asset: add playground for rollup-plugin-copy [[2fdb86e](https://github.com/guanghechen/node-scaffolds/commit/2fdb86e6b7c347d73a16a713dcfdac6d6bc18ba7)]

### Fixed

- 🐛 fix([#1](https://github.com/guanghechen/node-scaffolds/issues/1)): wait write finish before trying to read [[f5133f5](https://github.com/guanghechen/node-scaffolds/commit/f5133f5098791c6e28e3b0ed51d66c4ac1e8597d)]
- 🐛 fix(#issue-1): transform is not re-trigered [[334551d](https://github.com/guanghechen/node-scaffolds/commit/334551d75ab101a9dd48bff4d001dd4675da2c23)]
- 🐛 fix: fix weird message printing [[12159ba](https://github.com/guanghechen/node-scaffolds/commit/12159baaef188c9086610865c3c4c08893dd8542)]

### Miscellaneous

- 📝 docs: update README [[0cb4b78](https://github.com/guanghechen/node-scaffolds/commit/0cb4b7883d629d45a75b0c4a18be44d055f7e119)]


<a name="1.9.0-alpha.0"></a>
## 1.9.0-alpha.0 (2022-02-16)

### Changed

- ⚡ improve: fix bugs &amp; merge copying operations [[eeb19a3](https://github.com/guanghechen/node-scaffolds/commit/eeb19a33cbff3548e843738aeda56ae4218a642c)]
- 🎨 improve: extract codes for copy single CopyItem [[cfee9a9](https://github.com/guanghechen/node-scaffolds/commit/cfee9a97a7163dbd1d0953ac5ddb7e9ef448fc63)]
- 🎨 refactor: refactor codes [[fa7befe](https://github.com/guanghechen/node-scaffolds/commit/fa7befe42f86df6188676db21923131c5fd309e7)]
- 🎨 [BREAKING] feat(rollup-plugin-copy): refactor options [[9a300b8](https://github.com/guanghechen/node-scaffolds/commit/9a300b8cd03ceda8ab22603e363edae2c7ea6443)]
- 🎨 refactor: rename types [[754ffe0](https://github.com/guanghechen/node-scaffolds/commit/754ffe0e0d21d187d82498d6fcee0a91973028d5)]
- 🎨 refactor(rollup-plugin-copy): refactor codes [[71bfea2](https://github.com/guanghechen/node-scaffolds/commit/71bfea2cf058e48e7614be2367212e8cdece6a25)]
- 🎨 refactor(rollup-plugin-copy): refactor codes [[26ec3ad](https://github.com/guanghechen/node-scaffolds/commit/26ec3ad17f35c4311dbcc80bda9f9a5f21ad1583)]

### Fixed

- 🐛 fix: fix type errors [[cf93f24](https://github.com/guanghechen/node-scaffolds/commit/cf93f243324af242f4c8ad0a7087009624827eb1)]
- 🐛 fix: check if renamed through comparing oldName and newName [[38a928a](https://github.com/guanghechen/node-scaffolds/commit/38a928ad48ab5a0bcf91937ec9ada5ee2f4c5df1)]

### Miscellaneous

-  feat: use chokidar to supprot watch mode [[aefc24b](https://github.com/guanghechen/node-scaffolds/commit/aefc24b98248516b26982f7cb7f669387b870533)]
- 📝 docs: update README [[d4d33d1](https://github.com/guanghechen/node-scaffolds/commit/d4d33d1add87324d07835702fd253549a81196ae)]


<a name="1.8.6"></a>
## 1.8.6 (2022-01-15)

### Changed

- 🎨 improve: set print width to 100 (80 is old) [[3a46483](https://github.com/guanghechen/node-scaffolds/commit/3a46483b4c6cb6f5efe0263d6ba5848c6201de59)]
- ⬆️ chore: upgrade dependencies and peerDependencies [[a67ef3d](https://github.com/guanghechen/node-scaffolds/commit/a67ef3d7f292c9c1ecff733ee79dc61c89f8ff21)]


<a name="1.8.5"></a>
## 1.8.5 (2021-12-05)

### Added

- ✨ feat: add useReactiveRef [[da80d82](https://github.com/guanghechen/node-scaffolds/commit/da80d825703bff5fe4322790712818c11d946093)]
- 👷‍♂️ chore: update ci configs [[67c4a89](https://github.com/guanghechen/node-scaffolds/commit/67c4a89ff0f17538e7e74dc075598971efa525ee)]

### Changed

- ⬆️ chore: upgrade dependencies [[af9ac75](https://github.com/guanghechen/node-scaffolds/commit/af9ac751a0c6da97025953b65afaffe5a2fba405)]
- 🔧 chore: github action don&#x27;t support diff colors [[19cc7c5](https://github.com/guanghechen/node-scaffolds/commit/19cc7c5c51c6c8fe88823a3a4ebc29d4810a8b12)]

### Miscellaneous

- 📝 docs: update badge url [[3db8165](https://github.com/guanghechen/node-scaffolds/commit/3db81653ff780a204d54b157ed2b5ea4df99cbb7)]


<a name="1.8.4"></a>
## 1.8.4 (2021-10-28)

### Added

- 👷‍♂️ chore: update ci configs [[0dab3fc](https://github.com/guanghechen/node-scaffolds/commit/0dab3fc6df0e4a4bdb54c5e328812adc45e45815)]
- ✅ test: update snapshots [[d9f13ee](https://github.com/guanghechen/node-scaffolds/commit/d9f13ee15ade1df358a1dff566942932281e17f4)]

### Changed

- 🔧 chore: upgrade peerDependencies [[aa6d178](https://github.com/guanghechen/node-scaffolds/commit/aa6d1787a75eacf65490a370ec5289b160f029a7)]
- 🔧 chore: update yarn.lock [[eac3b3c](https://github.com/guanghechen/node-scaffolds/commit/eac3b3c028e83c4c8d518755b840a71b80aa7ee1)]
- ⬆️ chore: upgrade dependencies [[6e9db81](https://github.com/guanghechen/node-scaffolds/commit/6e9db8190fa712ac995640102b3f1844e0b5c7c1)]

### Miscellaneous

-  feat: update eslint rules [[e5d7583](https://github.com/guanghechen/node-scaffolds/commit/e5d7583597fd507d4fd36d17463951dbec79c06e)]


<a name="0.0.0"></a>
## 0.0.0 (2021-10-28)

### Added

- 👷‍♂️ chore: update ci configs [[67c4a89](https://github.com/guanghechen/node-scaffolds/commit/67c4a89ff0f17538e7e74dc075598971efa525ee)]


<a name="1.8.3"></a>
## 1.8.3 (2021-08-18)

### Fixed

- 🐛 fix(react-hooks): update callback when the passed one changed [[fe45c03](https://github.com/guanghechen/node-scaffolds/commit/fe45c033e2b137bf178dfbe76858aae47137c840)]


<a name="1.8.2"></a>
## 1.8.2 (2021-08-14)

### Added

- ✨ feat: add new sub-package &#x27;@guanghechen/react-hooks&#x27; [[7724209](https://github.com/guanghechen/node-scaffolds/commit/7724209c69b95ddac8055786bf2e80a5b599b21c)]

### Changed

- ⬆️ chore: upgrade dependencies [[4d0261c](https://github.com/guanghechen/node-scaffolds/commit/4d0261c014b759c43e7e20b8b5e2cde5e34332dc)]


<a name="1.8.1"></a>
## 1.8.1 (2021-08-06)

### Added

- ✅ test: update snapshots and types [[b4f862a](https://github.com/guanghechen/node-scaffolds/commit/b4f862a9ee19cc61f80511a274d3d5a7c6794a7a)]
- ✨ feat(tool-git-cipher): support new config property &#x60;sensitiveDirectories&#x60; for sub-command &#x60;encrypt&#x60; [[7e37655](https://github.com/guanghechen/node-scaffolds/commit/7e3765597e613a8307fccf13db4f9dcdcbcf8f5d)]

### Changed

- ⬆️ chore: upgrade dependencies [[4d05155](https://github.com/guanghechen/node-scaffolds/commit/4d05155649c588371dea129b2df8553f4dec5342)]

### Miscellaneous

- 📝 docs: update READMEs [[c4c7d8e](https://github.com/guanghechen/node-scaffolds/commit/c4c7d8e24e12734197b3a92b7ac17d6dc68b71cb)]
- 🚧 improve(blob-helper): perform clear actions after downloaded [[5887f04](https://github.com/guanghechen/node-scaffolds/commit/5887f04f7204aa549fefecf40d2ec1634f476bff)]


<a name="1.8.0"></a>
## 1.8.0 (2021-07-21)

### Added

- ✨ feat: add sub-package &#x27;@guanghechen/redux-actions&#x27; (migrated from @barusu/redux-actions) [[b23228f](https://github.com/guanghechen/node-scaffolds/commit/b23228fb4119ab598a0dcb00d00d85e86560e277)]
- ✨ feat: add sub-package &#x27;@guanghechen/blob-helper&#x27; (migrated from @baurusu/blob-helper) [[d879fe9](https://github.com/guanghechen/node-scaffolds/commit/d879fe9b0fd531cbc193b8a5a9b2fba91a238f63)]


<a name="1.7.1"></a>
## 1.7.1 (2021-07-07)

### Miscellaneous

-  improve(plop-helper): throw error if author is not detected [[87b43f0](https://github.com/guanghechen/node-scaffolds/commit/87b43f0df7945dbbb250c230baccafee017bd40f)]


<a name="1.7.0"></a>
## 1.7.0 (2021-07-03)

### Changed

- ♿ improve(tool-git-cipher): ask for confirming before empty target directory [[1133b68](https://github.com/guanghechen/node-scaffolds/commit/1133b6884e250d23ee569ee4e1e7064cdcd08f0f)]

### Fixed

- 🐛 fix(cipher-helper): trigger and wait for the end of the writer stream when merging multiple file streams. [[70e9375](https://github.com/guanghechen/node-scaffolds/commit/70e937531e52e087667eb82ffa56d649a9d75bd1)]

### Miscellaneous

-  improve(tool-git-cipher): add debug infos [[e6917da](https://github.com/guanghechen/node-scaffolds/commit/e6917da1c0dfbea14b798e628b4d6331d34c5bef)]


<a name="1.7.0-alpha.3"></a>
## 1.7.0-alpha.3 (2021-07-03)

### Fixed

- 🐛 fix: create an empty sourceRootDir when run sub-command &#x27;init&#x27; [[d227ca3](https://github.com/guanghechen/node-scaffolds/commit/d227ca377d42b49875a273dc88540215a3e963ba)]

### Miscellaneous

-  feat(tool-git-cipher): BREAKING change options [[77fe4ee](https://github.com/guanghechen/node-scaffolds/commit/77fe4eebd66f65efe87c754c553f920408c2e1fc)]
-  improve(tool-git-cipher): create new catalog index file if it&#x27;s not existed when run sub-command &#x27;encrypt&#x27; [[a40bbea](https://github.com/guanghechen/node-scaffolds/commit/a40bbea2cb119f11c11188991e6b6aa37e416516)]
-  improve(cipher-helper): remove original big target file when it splited into multiple parts [[328152c](https://github.com/guanghechen/node-scaffolds/commit/328152c2d5d90a38aaf6f62a1c77e38ce2159624)]
-  improve(file-helper): allow empty files [[23c4620](https://github.com/guanghechen/node-scaffolds/commit/23c46200fcb82cd68bc68eeba031ee0e7fa6bdfc)]


<a name="1.7.0-alpha.2"></a>
## 1.7.0-alpha.2 (2021-07-03)

### Added

- ✨ feat(tool-git-cipher): support specify max target file size [[52736d9](https://github.com/guanghechen/node-scaffolds/commit/52736d96646d17cf1d31c0a8ce4b88c09064faa0)]
- ✨ feat(cipher-helper): implement &#x27;CipherCatalog&#x27; [[7bcf91b](https://github.com/guanghechen/node-scaffolds/commit/7bcf91b5ee539267c3d08a1ba42164259dcbb223)]
- ✨ feat(file-helper): provide new fs utility func &#x27;collectAllFiles&#x27; [[2a1a9a2](https://github.com/guanghechen/node-scaffolds/commit/2a1a9a25f795a5acc7400472d5832a4f95e26423)]

### Changed

- 🎨 improve: use @guanghechen/cipher-helper to simplify codes [[5ace87d](https://github.com/guanghechen/node-scaffolds/commit/5ace87dc830acba3bcc6fd4ef9182f2e45cbb17a)]
- 🚚 refactor: move &#x27;collectAllFilesSync&#x27; from @guanghechen/commander-helper to @guanghechen/file-helper [[2b0c656](https://github.com/guanghechen/node-scaffolds/commit/2b0c656a69b61030e6d23bf3ecc50b708a5bd749)]
- 🚚 refactor: move &#x27;absoluteOfWorkspace&#x27; and &#x27;relativeOfWorkspace&#x27; from @guanghechen/commander-helper to @guanghechen/file-helper [[80d933a](https://github.com/guanghechen/node-scaffolds/commit/80d933ad4287cc82f3abdf5b3038778ddfa1ab29)]

### Miscellaneous

- 🔨 chore(commander-helper): add dependencies [[fec52bf](https://github.com/guanghechen/node-scaffolds/commit/fec52bf52f1934a8f07503bf3fe484ef30b2d5ab)]


<a name="1.7.0-alpha.1"></a>
## 1.7.0-alpha.1 (2021-07-02)

### Changed

- 🎨 improve(cipher-helper): support encrypt / decrypt contents from source files into Buffer [[685a9a6](https://github.com/guanghechen/node-scaffolds/commit/685a9a690c6bddcfb0ccd2cec132b92ab4553a9a)]

### Miscellaneous

- 🔨 chore: bundle cli.js for @guanghechen/tool-git-cipher [[886f12b](https://github.com/guanghechen/node-scaffolds/commit/886f12b85403cdd354701ba2fe2007cb6a1f0928)]


<a name="1.7.0-alpha.0"></a>
## 1.7.0-alpha.0 (2021-07-02)

### Added

- ✨ feat: implement new sub-package &#x27;@yozora/cipher-helper&#x27; [[3eb59a8](https://github.com/guanghechen/node-scaffolds/commit/3eb59a81d5dc85172fc0fb6fc31231b6331cba6a)]
- ✅ test: simplify test codes [[6a25607](https://github.com/guanghechen/node-scaffolds/commit/6a25607ddd22f14f99a7b648ce8a29acdaa98ac3)]
- ✨ feat(file-helper): implement stream utils [[3425d47](https://github.com/guanghechen/node-scaffolds/commit/3425d47a75ccf61416af615fd12e881866baa53f)]
- ✨ feat: implements new sub-package @guanghechen/file-helper [[906caa7](https://github.com/guanghechen/node-scaffolds/commit/906caa70ad846b92185faac0103a41225a92a60e)]
- ✅ test: update test configs [[fa1a5c6](https://github.com/guanghechen/node-scaffolds/commit/fa1a5c62eb0bf185bf8fc61b9c83a9524d31b33f)]
- ✨ feat: implements new sub-package/tool-git-cipher (migrated from @barusu/tool-git-cipher) [[6edc56d](https://github.com/guanghechen/node-scaffolds/commit/6edc56d49aabb32b055d90ce1b36d23183ac90ff)]
- ✨ feat: implements new sub-package @guanghechen/event-bus (migrated from @barusu/event-bus) [[b66e1fd](https://github.com/guanghechen/node-scaffolds/commit/b66e1fd92cb85609548cfbf5c7a9dda0746ed7c3)]
- ✨ feat: implements new sub-package @guanghechen/commander-helper (migrated from @barusu/util-cli) [[1c10b50](https://github.com/guanghechen/node-scaffolds/commit/1c10b50258a6a5debda8e7e50026118d358cd1c1)]
- ✨ feat: implements new sub-package @guanghechen/invariant [[13eab1e](https://github.com/guanghechen/node-scaffolds/commit/13eab1e0ce1706f10ea88b7dc8a484b7f19c94a4)]
- ✨ feat: add @guanghechen/chalk-logger (migrated from @barusu/chalk-logger) [[b343c23](https://github.com/guanghechen/node-scaffolds/commit/b343c236e30ae6085adc7684bc04fe6747c12e81)]
- ✨ feat(jest-helper): add logger mock util [[97005b2](https://github.com/guanghechen/node-scaffolds/commit/97005b28b06d47256fe6141d273d21a52228071b)]

### Changed

- 🎨 improve: simplify codes with @yozora/cipher-helper [[f92544a](https://github.com/guanghechen/node-scaffolds/commit/f92544a195df3841e5856cdf5507dc00f69130b4)]
- 🚚 refactor: move fs utils from @guanghechen/commander-helper to @guanghechen/file-helper [[a4ea316](https://github.com/guanghechen/node-scaffolds/commit/a4ea3163275ec33513af81e921bd0f0a721c8313)]
- ⬇️ chore: downgrade commander from v8.0.0 to v7.2.0 [[64547c8](https://github.com/guanghechen/node-scaffolds/commit/64547c834e00a9d9dd87f2d922a2e5568e633a6a)]
- 🎨 improve(invariant): accept null type of message [[cbcf592](https://github.com/guanghechen/node-scaffolds/commit/cbcf592cec8b487c63ec2ca6d271dab04018cdf9)]
- ⬆️ chore: upgrade dependencies [[4ab8a9a](https://github.com/guanghechen/node-scaffolds/commit/4ab8a9ad0886188cb575866e51e469cbf960e262)]

### Fixed

- 🐛 fix(jest-helper): &#x27;reateFilepathDesensitizer&#x27; baseDir is no need to immediately follow a whitespace. [[2b12d3a](https://github.com/guanghechen/node-scaffolds/commit/2b12d3a2f415f7f4f8b4d3a0c48b60224c29abcc)]

### Miscellaneous

- 📝 docs: update descriptions [[2af6d2c](https://github.com/guanghechen/node-scaffolds/commit/2af6d2cda26c431b65dfe1050ebdc82d2c607eb2)]
-  improve(eslint-config-ts): apply rule &#x27;@typescript-eslint/no-misused-promises&#x27; [[38d8512](https://github.com/guanghechen/node-scaffolds/commit/38d851285a39e0e2d81b5552de1f7ad08d938843)]
- 📝 docs(chalk-logger): add demo and screenshots [[abaf7fa](https://github.com/guanghechen/node-scaffolds/commit/abaf7fafdf38e7ecefd7bdfd0d411dd3255d71ef)]
-  style: fix lint errors [[1d59600](https://github.com/guanghechen/node-scaffolds/commit/1d596002c0ea4d827b5131f59b222bf9281eb811)]


<a name="1.6.1"></a>
## 1.6.1 (2021-06-26)

### Added

- ✅ test: update snapshots [[805f3f9](https://github.com/guanghechen/node-scaffolds/commit/805f3f97366bfc8ce4dcaeb59d306d92364dad8f)]

### Changed

- 🔧 chore: clip devDependencies [[5e9c636](https://github.com/guanghechen/node-scaffolds/commit/5e9c636be47ae02d4330403b4f47d840b998b8fb)]


<a name="1.6.0"></a>
## 1.6.0 (2021-06-26)

### Added

- ✅ test: update snapshots [[409502a](https://github.com/guanghechen/node-scaffolds/commit/409502a67cfc06154b912fb62ba22b51d10edbab)]

### Changed

- ⬆️ chore: upgrade dependencies [[5ab55f3](https://github.com/guanghechen/node-scaffolds/commit/5ab55f3f233a673ecebd857919741a54080ea7b9)]
- ⚡ improve(parse-lineno): no de-duplicate needed if there is only one interval [[1dd23b3](https://github.com/guanghechen/node-scaffolds/commit/1dd23b3da8d748c8a2d4440d86e79a66ad61ac01)]

### Removed

- ➖ improve(rollup-config): remove dependencies [[9ca1fff](https://github.com/guanghechen/node-scaffolds/commit/9ca1fffe10a9309f48eb5d3a0229714fc95f83c8)]

### Miscellaneous

-  feat: use @rollup/plugin-typescript instead of rollup-plugin-typescript2 (the types files is no longer generated through the rollup config) [[91a7c6c](https://github.com/guanghechen/node-scaffolds/commit/91a7c6ca9eb5f889c11ed5bc15edc32edd8fc499)]


<a name="1.5.5"></a>
## 1.5.5 (2021-06-18)

### Added

- ✨ feat(parse-lineno): support custom separator [[c460cd0](https://github.com/guanghechen/node-scaffolds/commit/c460cd02380b81807aedc5ca791cacca8a6124f1)]

### Changed

- ⚡ improve(parse-lineno): avoid performance problems caused by repeated large intervals [[266c46f](https://github.com/guanghechen/node-scaffolds/commit/266c46fa73a332f3faf1555289cf0507e43b6c4e)]


<a name="1.5.4"></a>
## 1.5.4 (2021-06-17)

### Added

- ✨ feat: implements new sub-package &#x27;@guanghechen/parse-lineno&#x27; [[9160afb](https://github.com/guanghechen/node-scaffolds/commit/9160afb39953b542548f95d1056e3415c942b5c8)]
- ✅ test: update snapshots [[a9b9987](https://github.com/guanghechen/node-scaffolds/commit/a9b9987c2843884e78adb5f5de14789a991795b9)]

### Changed

- ⬆️ chore: upgrade dependencies [[b8beb51](https://github.com/guanghechen/node-scaffolds/commit/b8beb5118dcd57e5c1aa79eb71e67f8e75f61a10)]
- 🔧 chore: don&#x27;t run &#x27;yarn-deduplicate&#x27; in ci environment [[3d9107a](https://github.com/guanghechen/node-scaffolds/commit/3d9107aa86732cbcb19d8b8cfb6dacf5a941e151)]
- 🔧 chore: update yarn.lock [[29787c0](https://github.com/guanghechen/node-scaffolds/commit/29787c0904ccf8aca5c76e24b1b9b261aadedb3e)]


<a name="1.5.3"></a>
## 1.5.3 (2021-06-13)

### Changed

- ⬆️ chore: upgrade dev dependencies [[7fa4cc8](https://github.com/guanghechen/node-scaffolds/commit/7fa4cc8c466b824d614fce730d3a4f3c783dd3f2)]

### Miscellaneous

- 🚧 improve(eslint-config-ts): enable lint rule &#x27;@typescript-eslint/no-floating-promises&#x27; [[503c1d3](https://github.com/guanghechen/node-scaffolds/commit/503c1d30b9aa36cba33941f5bacb327a382a05e8)]


<a name="1.5.2"></a>
## 1.5.2 (2021-06-08)

### Changed

- 🔧 chore: use Typescript under the node_modules/ instead of the one vscode built-in [[3e16cba](https://github.com/guanghechen/node-scaffolds/commit/3e16cbabb14033b1c7a755d38bacf87ac7d32a10)]
- 🔧 chore(jest-helper): update peer dependencies [[a7ad5f2](https://github.com/guanghechen/node-scaffolds/commit/a7ad5f270ca197fc169a1387c329757501dd72eb)]
- 🔧 chore: update configs [[d59c5f3](https://github.com/guanghechen/node-scaffolds/commit/d59c5f3a036fd7b01a90c6bb01a5120eb6c25b15)]
- ⬆️ chore: upgrade dependencies [[807e04b](https://github.com/guanghechen/node-scaffolds/commit/807e04b53eb168075357bda611612ebb2a1f48b6)]


<a name="1.5.1"></a>
## 1.5.1 (2021-05-21)

### Miscellaneous

- 🚧 feat(option-helper): support new utility func &#x27;convertToInteger&#x27; and &#x27;coverInteger&#x27; [[958eb4a](https://github.com/guanghechen/node-scaffolds/commit/958eb4a56454dba5efa3155808bd619cab0f52e4)]


<a name="1.5.0"></a>
## 1.5.0 (2021-05-20)

### Changed

- 🎨 style: upgrade dev dependencies &amp; lint codes [[701c8fa](https://github.com/guanghechen/node-scaffolds/commit/701c8fa0e3bf75e8c0f74e1a6fad725fc2f009f0)]
- 🔧 chore: rename default branch to &#x27;main&#x27; instead of &#x27;master&#x27; [[d673779](https://github.com/guanghechen/node-scaffolds/commit/d67377941bdb90545c518aa0039101a36c0b9c9e)]
- 🔧 chore: update lint ignore patterns [[3fec6b2](https://github.com/guanghechen/node-scaffolds/commit/3fec6b2f3593f246e839aee878f4b239518bb612)]

### Breaking changes

- 💥 improve: upgrade postcss to v8 [[9fae3c1](https://github.com/guanghechen/node-scaffolds/commit/9fae3c18af67d8fe2f865415aa6e43a6403372e9)]

### Miscellaneous

- 🔨 chore: trigger ci on creating new release tag instead of pushing to main branch [[4a98d45](https://github.com/guanghechen/node-scaffolds/commit/4a98d452844037f8e05e7727cc609fb21f2f5005)]


<a name="1.4.1"></a>
## 1.4.1 (2021-04-03)

### Miscellaneous

- 🚧 [option-helper] feat: expose new utility func &#x27;isDate&#x27; [[9a49e36](https://github.com/guanghechen/node-scaffolds/commit/9a49e36e3905df8a2cabac77665a69c397b6533e)]


<a name="0.0.0"></a>
## 0.0.0 (2021-04-03)

### Changed

- 🔧 chore: update lint ignore patterns [[3fec6b2](https://github.com/guanghechen/node-scaffolds/commit/3fec6b2f3593f246e839aee878f4b239518bb612)]


<a name="1.4.0"></a>
## 1.4.0 (2021-03-27)

### Added

- ✨ feat: add new sub-package @guanghechen/utility-types [[3df8c6a](https://github.com/guanghechen/node-scaffolds/commit/3df8c6aff7f9b41a015c7d89d90c64d11a04fb20)]

### Changed

- ⬆️ chore: upgrade dependencies [[5e5182d](https://github.com/guanghechen/node-scaffolds/commit/5e5182d44f8907c864aeaea4497e67ad890aebbc)]


<a name="1.3.1"></a>
## 1.3.1 (2021-03-20)

### Fixed

- 🐛 fix(jest-helper): misplaced the arguments of nextVersion of createPackageVersionDesensitizer [[53ad338](https://github.com/guanghechen/node-scaffolds/commit/53ad338569bd36720669d0ec11d1643fab916145)]


<a name="1.3.0"></a>
## 1.3.0 (2021-03-20)

### Added

- ✅ test: update tests [[5229cd3](https://github.com/guanghechen/node-scaffolds/commit/5229cd30e84046efe14bdf57c0498f2f834a24f4)]
- ✅ test(jest-helper): fix failed test [[722f960](https://github.com/guanghechen/node-scaffolds/commit/722f960f5192a34f1c1392b44c5258ac8863be42)]

### Fixed

- 🐛 fix(template-ts-package): update boilaptes [[3209b00](https://github.com/guanghechen/node-scaffolds/commit/3209b005d87d5bc083f98c0f66b9695a015f6bd7)]

### Miscellaneous

- 📝 docs: update REAWDME [[eef40f4](https://github.com/guanghechen/node-scaffolds/commit/eef40f4fab9da09a39a50ca77c9ab69ed00124f4)]
- 🚧 feat(jest-helper): desentizer accept potential &#x60;key&#x60; as the second parameter [[76fc1ca](https://github.com/guanghechen/node-scaffolds/commit/76fc1ca073833f8b05756dbaf7dcb4b9f61e4bf3)]
- 📝 docs: update badges [[b298cd6](https://github.com/guanghechen/node-scaffolds/commit/b298cd6b331adc29a10a1749caba04bb88a804c9)]


<a name="1.2.1"></a>
## 1.2.1 (2021-03-19)

### Added

- ✨ feat: add new sub-package @guanghechen/jest-config [[7051ad4](https://github.com/guanghechen/node-scaffolds/commit/7051ad426ec235f666c29047f8cd970c45ecd7e5)]

### Changed

- 🔧 chore: update lint configs &amp; lint codes [[eaaec6a](https://github.com/guanghechen/node-scaffolds/commit/eaaec6a029634342cd6ebe2fd1c99d8a5303805e)]

### Miscellaneous

- 🚧 feat(eslint-config): turn off options which are expensive to execute [[81b930f](https://github.com/guanghechen/node-scaffolds/commit/81b930f007710baefa8fa7e2c0ec8c34729d8314)]


<a name="1.2.0"></a>
## 1.2.0 (2021-03-17)

### Added

- ✨ feat: add new sub-package @guanghechen/npm-helper [[92ad2c5](https://github.com/guanghechen/node-scaffolds/commit/92ad2c5aa9920e3cb6bb0eeb0e1917901a9cae45)]
- ✅ test(plop-helper): use @guanghechen/jest-util to simplify codes [[ea7f6a8](https://github.com/guanghechen/node-scaffolds/commit/ea7f6a8606e7605bcbfcf2ee7faf554ddfd3089e)]
- ✅ test(option-helper): add missing expect to fix lint warnings [[5da1872](https://github.com/guanghechen/node-scaffolds/commit/5da187221c7ce01cdab86fd805110994521a1927)]
- ✅ test: fix failed tests [[b328f34](https://github.com/guanghechen/node-scaffolds/commit/b328f349f01f11d46d52cc5f6931b7bce4aa74dd)]

### Changed

- 🔧 chore: update pretest script [[4f1d463](https://github.com/guanghechen/node-scaffolds/commit/4f1d463c5dc53a7fbdf6862210fdfeac183d2614)]
- 🎨 improve: simplify codes with @guanghechen/npm-helper [[07b8ca9](https://github.com/guanghechen/node-scaffolds/commit/07b8ca950f6b3591cdfe5df2ed6889962b599a9f)]

### Miscellaneous

- 🚧 feat(locate-helper): expose new utility func &#x60;locateLatestPackageJson&#x60; [[b04e1c6](https://github.com/guanghechen/node-scaffolds/commit/b04e1c6386cb423b76aea76a0191a22f7e5367a3)]
- 🚧 feat(jest-helper): expose new utility func &#x60;createConsoleMock&#x60; [[02768b4](https://github.com/guanghechen/node-scaffolds/commit/02768b48315e2bb72d1673d074ee2fc1e767eadc)]


<a name="1.1.0"></a>
## 1.1.0 (2021-03-16)

### Added

- ✅ test(template-ts-package,template-tsx-package): update jest configs &amp; update tests [[5bd8b77](https://github.com/guanghechen/node-scaffolds/commit/5bd8b77b6f6bb6e2eca5ab145361f9858af316ca)]
- ✅ test(jest-helper): add tests [[3816006](https://github.com/guanghechen/node-scaffolds/commit/38160060531325a6691645fe03dd99fa6d381353)]
- ✨ feat: add new sub-package @guanghechen/jest-helper [[e61c869](https://github.com/guanghechen/node-scaffolds/commit/e61c869211790770e307eca1e941605f69d09b93)]
- ➕ chore(plop-helper): make plop as a package dependency [[c6b0a58](https://github.com/guanghechen/node-scaffolds/commit/c6b0a58820cbc31782af554dcc5e1b0b19cd01e1)]

### Changed

- 🔧 chore: perform build in @guanghechen/rollup-config and @guanghechen/plop-helper before run test [[c939cb9](https://github.com/guanghechen/node-scaffolds/commit/c939cb9b09be3506a8676eeca89c6c112da6f179)]
- 🎨 improve(plop-helper): split prompts into smaller pieces &amp; update README [[89cfaed](https://github.com/guanghechen/node-scaffolds/commit/89cfaedb4033c225c27b5473f34093bc16627aad)]

### Fixed

- 🐛 fix(template-tsx-package): fix bugs in package.json.hbs [[9d5a703](https://github.com/guanghechen/node-scaffolds/commit/9d5a7035b735311b7e03af178aebfce5199d8811)]

### Miscellaneous

- 🚧 feat(plop-helper): update due to the previous change &amp; expose new test utility func &#x27;runPromptsWithMock&#x27; &amp; update tests [[ef94c91](https://github.com/guanghechen/node-scaffolds/commit/ef94c912e3078f722a807800826352f4bcd12bc6)]
-  :feat(option-helper):  remove TextTransformerBuilder and expose composeTextTransformers instead &amp; update tests [[bf9aba0](https://github.com/guanghechen/node-scaffolds/commit/bf9aba0e9f71b20a4d57c5ace168b7ccf67e8c04)]
- 📝 docs: update README [[f390171](https://github.com/guanghechen/node-scaffolds/commit/f3901713c9f15debf948bc7c1313f666c88f294b)]
- 🚧 feat(plop-helper): support node-plop api &amp; utility funcs for testing plop &amp; update tests [[788a47d](https://github.com/guanghechen/node-scaffolds/commit/788a47db79e48719483eab3ac8097c815b1753cf)]
- 🚧 improve(template-ts*-package): update README.md.hbs [[135f2d1](https://github.com/guanghechen/node-scaffolds/commit/135f2d1b9afed9ec94cb7aa186766ec51ba7bfc5)]
- 📝 style: format READMEs [[3bc7ae8](https://github.com/guanghechen/node-scaffolds/commit/3bc7ae877157aea254f352f0f25ce98ee73b5d9f)]


<a name="1.0.13"></a>
## 1.0.13 (2021-03-13)

### Added

- ➕ chore: add missed peerDependencies [[8cfa03c](https://github.com/guanghechen/node-scaffolds/commit/8cfa03c78c3ae27b6cf8b7fd926f06c2896e0efe)]

### Miscellaneous

- 🚧 [eslint-config*] feat: update parserOptions and rules [[2bdf33e](https://github.com/guanghechen/node-scaffolds/commit/2bdf33eed499ec57ab4e32a4bb92768b5e92b73e)]
- 📝 docs: update READMEs [[4a69754](https://github.com/guanghechen/node-scaffolds/commit/4a69754b2f07dd29ff76c9521c3356b070c4ff9b)]


<a name="1.0.12"></a>
## 1.0.12 (2021-03-12)

### Changed

- 🎨 [plop-helper] improve: deduplicate codes with the features of @guanghechen/option-helper [[1099f9f](https://github.com/guanghechen/node-scaffolds/commit/1099f9f85fd9fcafeda1b110eb97c5240dbb22de)]
- 🔧 chore: update lint configs &amp; lint codes [[c00517c](https://github.com/guanghechen/node-scaffolds/commit/c00517c30f3ceace3d0d13ef793ca1a518302241)]

### Miscellaneous

- 🔀 Merge branch &#x27;develop&#x27; [[83e1275](https://github.com/guanghechen/node-scaffolds/commit/83e12750b0209ef2663af2ae22085e13b81e3570)]
- 🚧 [option-helper] feat: expose new utility class &#x27;TextTransfomerBuilder&#x27; [[ffe780e](https://github.com/guanghechen/node-scaffolds/commit/ffe780eeed453b9cf1f558dbc15abb57a86c511d)]
- 🚧 [eslint-config] improve: enable sort/imports to sort imports members in default [[5c85921](https://github.com/guanghechen/node-scaffolds/commit/5c85921042919e402d48fa52d3f3bb1c4df3f416)]


<a name="1.0.11"></a>
## 1.0.11 (2021-03-11)

### Added

- ✨ feat: add new sub-package @guanghechen/template-tsx-package (migrated from @barusu-react/template-react-package) [[ca108fb](https://github.com/guanghechen/node-scaffolds/commit/ca108fb897d977ebc6c101eda4c56040efebb915)]
- ✨ feat: add new sub-package @guanghechen/plop-helper [[880f62f](https://github.com/guanghechen/node-scaffolds/commit/880f62f9efe5608af7b9f2e0b1bc0cb184bf00e8)]

### Changed

- 🔧 chore: add missing devDependencies [[ebf8071](https://github.com/guanghechen/node-scaffolds/commit/ebf8071f16fe8dccfb0a27e8a288f9f3dd232b3a)]
- 🔧 chore(tsconfig): fix project path alias [[bd43ad6](https://github.com/guanghechen/node-scaffolds/commit/bd43ad667a7ffb37e7945b844408136f44256707)]
- 🎨 [rollup-config] improve: mute error [ERR_PACKAGE_PATH_NOT_EXPORTED] [[d99e479](https://github.com/guanghechen/node-scaffolds/commit/d99e4791629c7bcb0d621fb47d16c9c1fa786d59)]

### Miscellaneous

- 📝 docs: update READMEs [[bc666b3](https://github.com/guanghechen/node-scaffolds/commit/bc666b35102472fa067b29ef560421962d8ad9e3)]
- 🚧 [template-ts-package] improve: use @guanghechen/plop-helper to deduplicate codes &amp; rename exposed bin name to &#x27;ghc-ts-package&#x27; [[05b921a](https://github.com/guanghechen/node-scaffolds/commit/05b921ac281cf647ef332f26de6615a12c33acde)]


<a name="1.0.10"></a>
## 1.0.10 (2021-03-09)

### Added

- ✅ [rollup-config-tsx] test: add tests [[3da3389](https://github.com/guanghechen/node-scaffolds/commit/3da3389f16fe647a4b5dd95bbaa3df65def55cde)]

### Changed

- 🔧 chore: use a more elegant way to load package.json under the current sub-package being packaged [[d9c8abf](https://github.com/guanghechen/node-scaffolds/commit/d9c8abf1bc25048e1cdb2b6b23afa0861b60a776)]

### Fixed

- 🐛 [rollup-config-tsx] fix: fix dependency conflicts [[71b4267](https://github.com/guanghechen/node-scaffolds/commit/71b4267280fa01df9447f2beb7cda1d05f0ae2ad)]

### Miscellaneous

- 🔀 Merge branch &#x27;develop&#x27; [[ba1adbf](https://github.com/guanghechen/node-scaffolds/commit/ba1adbf831db72f79be1e7b11c4a79ec834a8257)]
- 📝 docs: update badges [[f00ecd9](https://github.com/guanghechen/node-scaffolds/commit/f00ecd9bc4c779f753c7664ec34608be6573475a)]
- 📝 [rollup-config-tsx] docs: update README [[e9fc767](https://github.com/guanghechen/node-scaffolds/commit/e9fc767393554c2c2567a4a5d4bf2b09e98835b7)]
- 🚧 [rollup-config-tsx] improve: fix bugs &amp; update options [[d85c66a](https://github.com/guanghechen/node-scaffolds/commit/d85c66a4cf8798c7e7f1c4da2e5aa55a6ef26cde)]
- 🚧 [rollup-config] improve: expose new Function &#x60;resolveRollupConfigEnvs&#x60; &amp; update README [[e344f65](https://github.com/guanghechen/node-scaffolds/commit/e344f658793bddef01d2e6f4fd0347e0594e1d70)]


<a name="1.0.9"></a>
## 1.0.9 (2021-03-07)

### Added

- ✨ feat: add new sub-package @guanghechen/rollup-config-tsx (migrated from @barusu-react/rollup-config) [[ecbcff6](https://github.com/guanghechen/node-scaffolds/commit/ecbcff6f70c037540f94b7d79bbaa611c41bc630)]
- ✅ [rollup-config] tests: add tests [[9883d58](https://github.com/guanghechen/node-scaffolds/commit/9883d58328efddf0dd4405d62d76b0124946c6a5)]

### Miscellaneous

-  :harmmer:  [rollup-config] chore: bundle with the exposed configs by self [[7209ce6](https://github.com/guanghechen/node-scaffolds/commit/7209ce61b0a9afb802c8958f285002c6338d436c)]
- 🚧 [rollup-config] improve: suport &#x60;string[]&#x60; type of option.manifest.*dependencies [[bbfe5cc](https://github.com/guanghechen/node-scaffolds/commit/bbfe5ccc938a32228965314c1b77d9abcf417e23)]


<a name="1.0.8"></a>
## 1.0.8 (2021-03-06)

### Changed

- ⬇️ chore: downgrade postcss-url to v9.0.0 to fix conlict error [[5641533](https://github.com/guanghechen/node-scaffolds/commit/56415337a845e9e2e280824c1c3e4aceb58809c9)]


<a name="1.0.7"></a>
## 1.0.7 (2021-03-06)

### Added

- ✨ feat: add new sub-package @guanghechen/rollup-config-tsx (migrated from @barusu-react/rollup-config) [[7dfa946](https://github.com/guanghechen/node-scaffolds/commit/7dfa94626177ef91f14b1c360829dacb1595c80d)]
- ✨ feat: add new sub-package @guanghechen/postcss-modules-dts (migrated from @barusu/rollup-plugin-postcss-dts) [[eabee8f](https://github.com/guanghechen/node-scaffolds/commit/eabee8fc0a1dba1e2571ac883d85b974c1e1be2f)]

### Changed

- 🔧 chore: no test cases yet [[3dfcd6b](https://github.com/guanghechen/node-scaffolds/commit/3dfcd6bed429e422ec75f9c3883ca172873d93e7)]

### Miscellaneous

- 🔀 Merge branch &#x27;develop&#x27; [[5e5fbbf](https://github.com/guanghechen/node-scaffolds/commit/5e5fbbfdba5ae92b5dd794dd1ce69aa378eee3c1)]
- 🚧 [template-ts-package] improve: update README boilerplates [[500390e](https://github.com/guanghechen/node-scaffolds/commit/500390ee2e13c757eb320e04027253959161741b)]


<a name="1.0.6"></a>
## 1.0.6 (2021-03-06)

### Fixed

- 🐛 [eslint-config-jsx] fix: fix &#x27;Cannot find module ./rule-create-react-app&#x27; [[b699d88](https://github.com/guanghechen/node-scaffolds/commit/b699d88e2dad316b06954089f15b286e29a86e4c)]


<a name="1.0.5"></a>
## 1.0.5 (2021-03-06)

### Miscellaneous

- 📝 chore: add node badge [[534f425](https://github.com/guanghechen/node-scaffolds/commit/534f42565cf7f4d55e6224c973dcba54cab5b54e)]
- 📝 docs: update badges url [[1e0b157](https://github.com/guanghechen/node-scaffolds/commit/1e0b15750d79eccd9fb193929de8c1a769434196)]


<a name="1.0.4"></a>
## 1.0.4 (2021-03-06)

### Fixed

- 🐛 [rollup-config-cli] fix: fix &#x27;external is not function&#x27; [[9c767d8](https://github.com/guanghechen/node-scaffolds/commit/9c767d8eb18a64d4899fd098c846a64ccf3c884f)]

### Miscellaneous

- 🔀 Merge branch &#x27;develop&#x27; [[0b46e6a](https://github.com/guanghechen/node-scaffolds/commit/0b46e6a54fb747b04b90390d6310c22b0df018b7)]


<a name="1.0.3"></a>
## 1.0.3 (2021-03-06)

### Added

- ✨ feat: add new sub-package @guanghechen/rollup-config-cli [[6d1be9c](https://github.com/guanghechen/node-scaffolds/commit/6d1be9c54cb44c5631207ae71d4ed6746c168b6c)]
- ✨ feat: add new sub-package @guanghechen/rollup-plugin-copy (migrated from @barusu/rollup-plugin-copy) [[6242b67](https://github.com/guanghechen/node-scaffolds/commit/6242b67b9d56476235dea22d1f5146ed52d23ada)]

### Changed

- 🔧 chore: lint json files before commit [[62e9cb6](https://github.com/guanghechen/node-scaffolds/commit/62e9cb65d42db0ca632df2ef26bf93f34a7a0ef4)]
- 🔧 chore: add script alias &#x27;new:ts-package&#x27; [[b29e99c](https://github.com/guanghechen/node-scaffolds/commit/b29e99c102034f15334dc2bc16d854de2749a4ad)]

### Miscellaneous

- 🔀 Merge branch &#x27;develop&#x27; [[96d9272](https://github.com/guanghechen/node-scaffolds/commit/96d927221ad530bfb08b54569a7cd1f227435878)]
- 📝 docs: update references [[4094bf2](https://github.com/guanghechen/node-scaffolds/commit/4094bf27a83419da0b94d3d5767fd01dd88c47a1)]
- 🚧 [template-ts-package] improve: ask for description in prompt [[9136e53](https://github.com/guanghechen/node-scaffolds/commit/9136e5338b856fdcfa657b7783411aba060a1bd5)]
- 📝 docs: update READMEs [[8d7402a](https://github.com/guanghechen/node-scaffolds/commit/8d7402afc00c7cb85ff7a30d6e5554c91fa5f6fc)]
- 🚧 [rollup-config] improve: support new option &#x60;additionalPlugins&#x60; [[e536df1](https://github.com/guanghechen/node-scaffolds/commit/e536df12d70ef024b0a1081748accd286fdf76c9)]
- 📝 docs: update badges [[8493dd7](https://github.com/guanghechen/node-scaffolds/commit/8493dd7825df4cb5d44d93cefc0d95f52c487b19)]
- 🚧 [eslint-config-ts] improve: set @typescript-eslint/method-signature-style to &#x27;method&#x27; instead of &#x27;property&#x27; [[2575855](https://github.com/guanghechen/node-scaffolds/commit/25758552157d54433d7bd4049aa644152bc9ac88)]


<a name="1.0.2"></a>
## 1.0.2 (2021-03-04)

### Added

- ✨ feat: add new package @guanghechen/template-ts-package (migrate from @barusu/template-ts-package) [[e74b600](https://github.com/guanghechen/node-scaffolds/commit/e74b6004cc77173947615b396dfae689444ad935)]

### Miscellaneous

- 🔀 Merge branch &#x27;develop&#x27; [[117863e](https://github.com/guanghechen/node-scaffolds/commit/117863e7720f6f7aeaa1dbfca06749d49234b801)]
- 🚧 [rollup-config] improve: external peerDependencies and optionalDependencies from bundle [[5baa682](https://github.com/guanghechen/node-scaffolds/commit/5baa682f20485bdca10895fe8d76d2adabe659a5)]
-  construction: [option-helper] improve: &#x60;cover&#x60; support validate funcs &amp; lazy default value [[e446460](https://github.com/guanghechen/node-scaffolds/commit/e4464600852b96db2c2994a7e5c86f640b4f63dd)]


<a name="1.0.1"></a>
## 1.0.1 (2021-03-03)

### Changed

- 🔧 chore: add github actions [[c5befe9](https://github.com/guanghechen/node-scaffolds/commit/c5befe9b5bdb7aeb033c07f0cbfd25a5b934215a)]

### Miscellaneous

- 🔀 Merge branch &#x27;develop&#x27; [[cb8f17c](https://github.com/guanghechen/node-scaffolds/commit/cb8f17c594eae39a4e4d60ac3113d7330bd96c16)]
- 📝 docs: add README [[127055f](https://github.com/guanghechen/node-scaffolds/commit/127055ff064021c53ff25b5212942d04fddaf171)]
- 🔨 chore: move rollup config to the top of the repository [[cc7472b](https://github.com/guanghechen/node-scaffolds/commit/cc7472bfb764d11a2ace5b2f40a00c8a99f83dfc)]
- 🚧 improve: update eslint configs [[916863a](https://github.com/guanghechen/node-scaffolds/commit/916863ad69c2fd6d51981c8db900eac00fb4e89d)]


<a name="1.0.0"></a>
## 1.0.0 (2021-03-02)

### Added

- ✨ feat: add new package @guanghechen/option-helper (migrage from @barusu/util-option) [[98c7f55](https://github.com/guanghechen/node-scaffolds/commit/98c7f55427e015797440c357dae1bea83d6754ba)]
- ✨ feat: add new package @guanghechen/rollup-config (migrate from @barusu/rollup-config) [[fe2d497](https://github.com/guanghechen/node-scaffolds/commit/fe2d4974a9f3d9b654d55f69b5f58daf8709f392)]
- ✨ feat: add new package @guanghechen/util-locate [[090a062](https://github.com/guanghechen/node-scaffolds/commit/090a0623aefc4fccffbd169f3a33db61b7b6f40b)]
- ✨ feat: add new package @guanghechen/eslint-config-jsx [[7852431](https://github.com/guanghechen/node-scaffolds/commit/7852431d020d8160f5bc5ddf53c3af329a5befa4)]
- ✨ feat: add new package @guanghechen/eslint-config-ts [[0f69126](https://github.com/guanghechen/node-scaffolds/commit/0f6912626a50e8c1e005c6ad13536cd71efad188)]
- ✨ feat: add new package @guanghechen/eslint-config [[205be3e](https://github.com/guanghechen/node-scaffolds/commit/205be3e131af817b6285337c17654435fb2da126)]
- 🎉 initialize [[3464452](https://github.com/guanghechen/node-scaffolds/commit/346445286dd311406c2b55fdc6692a0465f43b9e)]

### Changed

- 🎨 style: format codes [[a3ca949](https://github.com/guanghechen/node-scaffolds/commit/a3ca9491f12adeed98cde0cd9bc1ea98891e2b13)]
- 🚚 refactor: rename @guanghechen/util-locate to @guanghechen/locate-helper [[dd1f6e1](https://github.com/guanghechen/node-scaffolds/commit/dd1f6e134b2722777e0dc3726500f26c66c9577c)]
- 🔧 chore: update eslint config [[93308ac](https://github.com/guanghechen/node-scaffolds/commit/93308accdb216b2a6aea9e8ef5640cb67f0f8091)]
- 🔧 chore: use prettier and format codes [[3b51a6e](https://github.com/guanghechen/node-scaffolds/commit/3b51a6eb68b11d8d38187b69def01ff3b6fde8a4)]

### Fixed

- 🐛 [locate-helper] fix: fix bugs &amp; add tests [[6cd5817](https://github.com/guanghechen/node-scaffolds/commit/6cd581755fc8c3a053410b679285f4b8fc9d0186)]

### Miscellaneous

- 🔀 Merge branch &#x27;develop&#x27; [[b7a36b0](https://github.com/guanghechen/node-scaffolds/commit/b7a36b0191bbd9461014132f3ed4d271125f8502)]
- 📝 docs: update READMEs [[6b757ad](https://github.com/guanghechen/node-scaffolds/commit/6b757ada2ed4d9184f521bf1c98a7601c333f74a)]
- 📄 doc: add MIT LICENSE [[c57fb34](https://github.com/guanghechen/node-scaffolds/commit/c57fb348aae48eb75a3c7bcc2660866db7a374b4)]
- 📝 chore: update docs [[54f7fa9](https://github.com/guanghechen/node-scaffolds/commit/54f7fa9dca064790ace8c6f6b3c090f6aab99a64)]
- 🚧 [eslint-config] feat: customize rules from eslint-config-import [[db01e61](https://github.com/guanghechen/node-scaffolds/commit/db01e61f2750b60a6e478a72ed2861ecd3ea84d5)]
- 🚧 [eslint-config] improve: remove unnecessary dependencies and configuration [[e0e4423](https://github.com/guanghechen/node-scaffolds/commit/e0e4423d384805ca78f3cbe630d63fa582ec5b7d)]
- 🔨 chore: config dev environment [[a2c0ec6](https://github.com/guanghechen/node-scaffolds/commit/a2c0ec66edc1176a5050956767ecade52a0cb9c1)]
