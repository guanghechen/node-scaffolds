# Changelog

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
- 📝 docs: update CHANGELOG [[bee6a04](https://github.com/guanghechen/node-scaffolds/commit/bee6a04a03eb6171d30f26d969382fec74dbcad9)]


<a name="1.6.1"></a>
## 1.6.1 (2021-06-26)

### Added

- ✅ test: update snapshots [[805f3f9](https://github.com/guanghechen/node-scaffolds/commit/805f3f97366bfc8ce4dcaeb59d306d92364dad8f)]

### Changed

- 🔧 chore: clip devDependencies [[5e9c636](https://github.com/guanghechen/node-scaffolds/commit/5e9c636be47ae02d4330403b4f47d840b998b8fb)]

### Miscellaneous

- 📝 docs: update CHANGELOG [[42c4ef2](https://github.com/guanghechen/node-scaffolds/commit/42c4ef2655be61eee5c09b100eb0e40b4575b848)]


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
- 📝 docs: update CHANGELOG [[0a9680e](https://github.com/guanghechen/node-scaffolds/commit/0a9680ec8eaa0f92d5aa61c4fcf60c2cb943000e)]


<a name="1.5.5"></a>
## 1.5.5 (2021-06-18)

### Added

- ✨ feat(parse-lineno): support custom separator [[c460cd0](https://github.com/guanghechen/node-scaffolds/commit/c460cd02380b81807aedc5ca791cacca8a6124f1)]

### Changed

- ⚡ improve(parse-lineno): avoid performance problems caused by repeated large intervals [[266c46f](https://github.com/guanghechen/node-scaffolds/commit/266c46fa73a332f3faf1555289cf0507e43b6c4e)]

### Miscellaneous

- 📝 docs: update CHANGELOG [[e9ece23](https://github.com/guanghechen/node-scaffolds/commit/e9ece232ce6b65eca04ee09104896e0254e2f4e2)]


<a name="1.5.4"></a>
## 1.5.4 (2021-06-17)

### Added

- ✨ feat: implements new sub-package &#x27;@guanghechen/parse-lineno&#x27; [[9160afb](https://github.com/guanghechen/node-scaffolds/commit/9160afb39953b542548f95d1056e3415c942b5c8)]
- ✅ test: update snapshots [[a9b9987](https://github.com/guanghechen/node-scaffolds/commit/a9b9987c2843884e78adb5f5de14789a991795b9)]

### Changed

- ⬆️ chore: upgrade dependencies [[b8beb51](https://github.com/guanghechen/node-scaffolds/commit/b8beb5118dcd57e5c1aa79eb71e67f8e75f61a10)]
- 🔧 chore: don&#x27;t run &#x27;yarn-deduplicate&#x27; in ci environment [[3d9107a](https://github.com/guanghechen/node-scaffolds/commit/3d9107aa86732cbcb19d8b8cfb6dacf5a941e151)]
- 🔧 chore: update yarn.lock [[29787c0](https://github.com/guanghechen/node-scaffolds/commit/29787c0904ccf8aca5c76e24b1b9b261aadedb3e)]

### Miscellaneous

- 📝 docs: update CHANGELOG [[c0ebbf6](https://github.com/guanghechen/node-scaffolds/commit/c0ebbf63e99c4f6f84f13780e0b830a855195a5d)]


<a name="1.5.3"></a>
## 1.5.3 (2021-06-13)

### Changed

- ⬆️ chore: upgrade dev dependencies [[7fa4cc8](https://github.com/guanghechen/node-scaffolds/commit/7fa4cc8c466b824d614fce730d3a4f3c783dd3f2)]

### Miscellaneous

- 🚧 improve(eslint-config-ts): enable lint rule &#x27;@typescript-eslint/no-floating-promises&#x27; [[503c1d3](https://github.com/guanghechen/node-scaffolds/commit/503c1d30b9aa36cba33941f5bacb327a382a05e8)]
- 📝 docs: update CHANGELOG [[465cc48](https://github.com/guanghechen/node-scaffolds/commit/465cc48548a16b872a20f81c05f7881b3c977eea)]


<a name="1.5.2"></a>
## 1.5.2 (2021-06-08)

### Changed

- 🔧 chore: use Typescript under the node_modules/ instead of the one vscode built-in [[3e16cba](https://github.com/guanghechen/node-scaffolds/commit/3e16cbabb14033b1c7a755d38bacf87ac7d32a10)]
- 🔧 chore(jest-helper): update peer dependencies [[a7ad5f2](https://github.com/guanghechen/node-scaffolds/commit/a7ad5f270ca197fc169a1387c329757501dd72eb)]
- 🔧 chore: update configs [[d59c5f3](https://github.com/guanghechen/node-scaffolds/commit/d59c5f3a036fd7b01a90c6bb01a5120eb6c25b15)]
- ⬆️ chore: upgrade dependencies [[807e04b](https://github.com/guanghechen/node-scaffolds/commit/807e04b53eb168075357bda611612ebb2a1f48b6)]

### Miscellaneous

- 📝 docs: update CHANGELOG [[5414cf4](https://github.com/guanghechen/node-scaffolds/commit/5414cf4f89c4842cc9952febf840052496ed1cbd)]


<a name="1.5.1"></a>
## 1.5.1 (2021-05-21)

### Miscellaneous

- 🚧 feat(option-helper): support new utility func &#x27;convertToInteger&#x27; and &#x27;coverInteger&#x27; [[958eb4a](https://github.com/guanghechen/node-scaffolds/commit/958eb4a56454dba5efa3155808bd619cab0f52e4)]
- 📝 docs: update CHANGELOG [[7adc829](https://github.com/guanghechen/node-scaffolds/commit/7adc82916614a0b8d0eeb4be05cedd31af876c46)]


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
- 📝 docs: update CHANGELOG [[598787d](https://github.com/guanghechen/node-scaffolds/commit/598787d3c4664dd08937ae1af1667c138b90af36)]


<a name="1.4.1"></a>
## 1.4.1 (2021-04-03)

### Miscellaneous

- 🚧 [option-helper] feat: expose new utility func &#x27;isDate&#x27; [[9a49e36](https://github.com/guanghechen/node-scaffolds/commit/9a49e36e3905df8a2cabac77665a69c397b6533e)]
- 📝 docs: update CHANGELOG [[8a44ef2](https://github.com/guanghechen/node-scaffolds/commit/8a44ef2eaafec3e3612e478ff6fb6cb9b5e65339)]


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

### Miscellaneous

- 📝 docs: update CHANGELOG [[ca21186](https://github.com/guanghechen/node-scaffolds/commit/ca21186f2e5b25ac784886aa3c8a3fd09c630823)]


<a name="1.3.1"></a>
## 1.3.1 (2021-03-20)

### Fixed

- 🐛 fix(jest-helper): misplaced the arguments of nextVersion of createPackageVersionDesensitizer [[53ad338](https://github.com/guanghechen/node-scaffolds/commit/53ad338569bd36720669d0ec11d1643fab916145)]

### Miscellaneous

- 📝 docs: udpate CHANGELOG [[6ae3092](https://github.com/guanghechen/node-scaffolds/commit/6ae30922a4099b5ece3dce9337d5ec4c26b39e70)]


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
- 📝 docs: update CHANGELOG [[107ee69](https://github.com/guanghechen/node-scaffolds/commit/107ee69158e37e9b8f51cf4838500217deac0290)]


<a name="1.2.1"></a>
## 1.2.1 (2021-03-19)

### Added

- ✨ feat: add new sub-package @guanghechen/jest-config [[7051ad4](https://github.com/guanghechen/node-scaffolds/commit/7051ad426ec235f666c29047f8cd970c45ecd7e5)]

### Changed

- 🔧 chore: update lint configs &amp; lint codes [[eaaec6a](https://github.com/guanghechen/node-scaffolds/commit/eaaec6a029634342cd6ebe2fd1c99d8a5303805e)]

### Miscellaneous

- 🚧 feat(eslint-config): turn off options which are expensive to execute [[81b930f](https://github.com/guanghechen/node-scaffolds/commit/81b930f007710baefa8fa7e2c0ec8c34729d8314)]
- 📝 docs: update CHANGELOG [[380249c](https://github.com/guanghechen/node-scaffolds/commit/380249c7e294679e21ecf6dde999b5a8ceb90667)]


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
- 📝 docs: update CHANGELOG [[5da7431](https://github.com/guanghechen/node-scaffolds/commit/5da743130b22b42b0b90b572e2ad11c1a754a5ba)]


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
- 📝 docs: update CHANGELOG [[e72a64e](https://github.com/guanghechen/node-scaffolds/commit/e72a64eaee22c9e0d824865505afeafe2b532e69)]
- 📝 docs: update CHANGELOG [[085d617](https://github.com/guanghechen/node-scaffolds/commit/085d61737d0a924e1dafd1d3c67eb07ae0a3074d)]


<a name="1.0.13"></a>
## 1.0.13 (2021-03-13)

### Added

- ➕ chore: add missed peerDependencies [[8cfa03c](https://github.com/guanghechen/node-scaffolds/commit/8cfa03c78c3ae27b6cf8b7fd926f06c2896e0efe)]

### Miscellaneous

- 🚧 [eslint-config*] feat: update parserOptions and rules [[2bdf33e](https://github.com/guanghechen/node-scaffolds/commit/2bdf33eed499ec57ab4e32a4bb92768b5e92b73e)]
- 📝 docs: update READMEs [[4a69754](https://github.com/guanghechen/node-scaffolds/commit/4a69754b2f07dd29ff76c9521c3356b070c4ff9b)]
- 📝 docs: update CHANGELOG [[fa66e37](https://github.com/guanghechen/node-scaffolds/commit/fa66e37c49c6a34b79b59561076b6e5abed4809a)]


<a name="1.0.12"></a>
## 1.0.12 (2021-03-12)

### Changed

- 🎨 [plop-helper] improve: deduplicate codes with the features of @guanghechen/option-helper [[1099f9f](https://github.com/guanghechen/node-scaffolds/commit/1099f9f85fd9fcafeda1b110eb97c5240dbb22de)]
- 🔧 chore: update lint configs &amp; lint codes [[c00517c](https://github.com/guanghechen/node-scaffolds/commit/c00517c30f3ceace3d0d13ef793ca1a518302241)]

### Miscellaneous

- 🔀 Merge branch &#x27;develop&#x27; [[83e1275](https://github.com/guanghechen/node-scaffolds/commit/83e12750b0209ef2663af2ae22085e13b81e3570)]
- 🚧 [option-helper] feat: expose new utility class &#x27;TextTransfomerBuilder&#x27; [[ffe780e](https://github.com/guanghechen/node-scaffolds/commit/ffe780eeed453b9cf1f558dbc15abb57a86c511d)]
- 🚧 [eslint-config] improve: enable sort/imports to sort imports members in default [[5c85921](https://github.com/guanghechen/node-scaffolds/commit/5c85921042919e402d48fa52d3f3bb1c4df3f416)]
- 📝 docs: update CHANGELOG [[ba22655](https://github.com/guanghechen/node-scaffolds/commit/ba226553a771a13fb3314f8dee525b448693e969)]


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
- 📝 docs: update CHANGELOG [[79be5f8](https://github.com/guanghechen/node-scaffolds/commit/79be5f84e5846fc0c45def6c4c86501005b30a24)]


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
- 📝 docs: update CHANGELOG [[1178073](https://github.com/guanghechen/node-scaffolds/commit/1178073b4a50e0faef1349a4670b35941d176489)]


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

### Miscellaneous

- 📝 docs: update CHANGELOG [[4da13fb](https://github.com/guanghechen/node-scaffolds/commit/4da13fb0dc65bbeba700bd94a95db58e8318473a)]


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
- 📝 docs: update CHANGELOG [[b24be9c](https://github.com/guanghechen/node-scaffolds/commit/b24be9c7b04de63469d2e5cf52d9bfc5da922b44)]


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
