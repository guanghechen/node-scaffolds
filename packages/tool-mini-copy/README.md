<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/tool-mini-copy@6.0.0-alpha.22/packages/tool-mini-copy#readme">@guanghechen/tool-mini-copy</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/tool-mini-copy">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/tool-mini-copy.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/tool-mini-copy">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/tool-mini-copy.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/tool-mini-copy">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/tool-mini-copy.svg"
      />
    </a>
    <a href="#install">
      <img
        alt="Module Formats: cjs"
        src="https://img.shields.io/badge/module_formats-cjs-green.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/tool-mini-copy"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="Eslint Version"
        src="https://img.shields.io/npm/dependency-version/@guanghechen/tool-mini-copy/peer/jest"
      />
    </a>
    <a href="https://github.com/prettier/prettier">
      <img
        alt="Code Style: prettier"
        src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"
      />
    </a>
  </div>
</header>
<br/>


A simple cli copy / paste with System clipboard or customized fake clipboard (file).

Notice: Only text data worked, don't try to copy / paste binary data with this command.


## Install

* npm

  ```bash
  npm install -g @guanghechen/tool-mini-copy
  ```

* yarn

  ```bash
  yarn global add @guanghechen/tool-mini-copy
  ```


## Usage

* Help
  ```bash
  $ mcp --help
  Usage: mcp [options] [source content]

  Options:
    -V, --version                                     output the version number
    --log-level <level>                               specify logger's level.
    --log-name <name>                                 specify logger's name.
    --log-mode <'normal' | 'loose'>                   specify logger's name.
    --log-flight <option>                             specify logger' option. [[no-]<date|title|colorful|inline>] (default: [])
    --log-filepath <filepath>                         specify logger' output path.
    --log-encoding <encoding>                         specify output file encoding.
    -c, --config-path <configFilepath>                config filepaths (default: [])
    --parastic-config-path <parasticConfigFilepath>   parastic config filepath
    --parastic-config-entry <parasticConfigFilepath>  parastic config filepath
    -e, --encoding <encoding>                         Encoding of content from stdin or file.
    -i, --input <filepath>                            Copy the data from <filepath> to the system clipboard.
    -o, --output <filepath>                           Write the data from the system clipboard into <filepath>.
    -f, --force                                       Overwrite the <filepath> without confirmation.
    -s, --silence                                     don't print info-level log.
    --force                                           force paste the content of the system clipboard without copy even piped data.
    --fake-clipboard [local filepath]                 Specify a fake clipboard.
    --strip-ansi                                      Strip ansi escape codes.
    -h, --help                                        display help for command
  ```

* Basic

  ```bash
  # output the content of the system clipboard
  mcp

  # copy the content of data.in to the system clipboard
  mcp 'the data'
  mcp -i data.in
  mcp < data.in
  cat data.in | mcp
  echo 'Hello world' | mcp


  # write the content of system clipboard into data.out
  mcp >> data.out             # use linux pipeline, redirected the content of system clipboard to data.out
  mcp -o data.out             # (recommended way)
  mcp -o data.out -e UTF-8    # specified the content's encoding
  mcp -o data.out -f          # if the data.out is exist, overwrite it without confirmation.


  # show usage
  mcp --help
  ```


## Related

* [share clipboard in vim on wsl][doc-wsl] 
* use fake clipboard([en][doc-fake-clipboard-en], [zh][doc-fake-clipboard-zh])


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/tool-mini-copy@6.0.0-alpha.22/packages/tool-mini-copy#readme
[doc-wsl]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/tool-mini-copy@6.0.0-alpha.22/packages/tool-mini-copy/doc/wsl.md
[doc-fake-clipboard-en]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/tool-mini-copy@6.0.0-alpha.22/packages/tool-mini-copy/doc/fake-clipboard-en.md
[doc-fake-clipboard-zh]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/tool-mini-copy@6.0.0-alpha.22/packages/tool-mini-copy/doc/fake-clipboard-zh.md
