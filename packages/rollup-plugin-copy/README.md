<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/rollup-plugin-copy@6.0.3/packages/rollup-plugin-copy#readme">@guanghechen/rollup-plugin-copy</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/rollup-plugin-copy">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/rollup-plugin-copy.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/rollup-plugin-copy">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/rollup-plugin-copy.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/rollup-plugin-copy">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/rollup-plugin-copy.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/rollup-plugin-copy"
      />
    </a>
    <a href="https://github.com/rollup/rollup">
      <img
        alt="Rollup Version"
        src="https://img.shields.io/npm/dependency-version/@guanghechen/rollup-plugin-copy/peer/rollup"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="Tested with Jest"
        src="https://img.shields.io/badge/tested_with-jest-9c465e.svg"
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


This project is modified from https://github.com/vladshcherbin/rollup-plugin-copy. (Migrated from https://www.npmjs.com/package/@barusu/rollup-plugin-copy).

A few months ago I submitted a [pr](https://github.com/vladshcherbin/rollup-plugin-copy/pull/42) that supports watch mode, but no response was received, so I decided to release it separately.


## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/rollup-plugin-copy
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/rollup-plugin-copy
  ```

# Usage

```js
// rollup.config.js
import copy from '@guanghechen/rollup-plugin-copy'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/app.js',
    format: 'cjs'
  },
  plugins: [
    copy({
      targets: [
        { src: 'src/index.html', dest: 'dist/public' },
        { src: ['assets/fonts/arial.woff', 'assets/fonts/arial.woff2'], dest: 'dist/public/fonts' },
        { src: 'assets/images/**/*', dest: 'dist/public/images' }
      ]
    })
  ]
}
```

## Configuration

There are some useful options:

### targets

Type: `Array` | Default: `[]`

Array of targets to copy. A target is an object with properties:

- **src** (`string|string[]`): Path or glob of what to copy

- **dest** (`string|string[]`): One or more destinations where to copy

- **rename** (`string | Function`): Change destination file or folder name

  ```typescript
  function rename(
    name: string,
    ext: string,
    srcPath: string,
  ): string
  ```

- **transform** (`Function`): Modify file contents

  ```typescript
  function transform(
    content: string | ArrayBuffer,
    srcPath: string,
    dstPath: string,
  ): Promise<string | ArrayBuffer>
  ```

- **copyOnce** (`boolean|undefined`): *Override the outer option.*

- **flatten** (`boolean|undefined`): *Override the outer option.*

- **verbose** (`boolean|undefined`): *Override the outer option.*

- **globbyOptions** (`GlobbyOptions`): *Override the outer option.*

- **fsOptions** (options of `node:fs`): *Override the outer option.*


Each object should have **src** and **dest** properties, **rename** and **transform** are optional. [globby](https://github.com/sindresorhus/globby) is used inside, check it for [glob pattern](https://github.com/sindresorhus/globby#globbing-patterns) examples.

#### File

```js
copy({
  targets: [{ src: 'src/index.html', dest: 'dist/public' }]
})
```

#### Folder

```js
copy({
  targets: [{ src: 'assets/images', dest: 'dist/public' }]
})
```

#### Glob

```js
copy({
  targets: [{ src: 'assets/*', dest: 'dist/public' }]
})
```

#### Glob: multiple items

```js
copy({
  targets: [{ src: ['src/index.html', 'src/styles.css', 'assets/images'], dest: 'dist/public' }]
})
```

#### Glob: negated patterns

```js
copy({
  targets: [{ src: ['assets/images/**/*', '!**/*.gif'], dest: 'dist/public/images' }]
})
```

#### Multiple targets

```js
copy({
  targets: [
    { src: 'src/index.html', dest: 'dist/public' },
    { src: 'assets/images/**/*', dest: 'dist/public/images' }
  ]
})
```

#### Multiple destinations

```js
copy({
  targets: [{ src: 'src/index.html', dest: ['dist/public', 'build/public'] }]
})
```

#### Rename with a string

```js
copy({
  targets: [{ src: 'src/app.html', dest: 'dist/public', rename: 'index.html' }]
})
```

#### Rename with a function

* Rename filename

  ```js
  copy({
    targets: [{
      src: 'assets/docs/*',
      dest: 'dist/public/docs',
      rename: (name, extension) => `${name}-v1.${extension}`
    }]
  })
  // assets/docs/a/b.md ==> dist/public/docs/a/b-v1.md
  ```

* Rename filepath

  ```js
  copy({
    targets: [{
      src: 'assets/docs/*',
      dest: 'dist/public/docs',
      rename: (name, extension, srcPath) => 
        path.join(path.relative('assets', path.dirname(srcPath)), `${name}-v1.${extension}`)
    }]
  })
  // assets/docs/a/b.md ==> dist/public/docs/docs/a/b-v1.md
  ```

#### Transform file contents

```js
copy({
  targets: [{
    src: 'src/index.html',
    dest: 'dist/public',
    transform: (contents, srcPath, destPath) => (
      contents.toString()
        .replace('__SCRIPT__', 'app.js')
        .replace('__SOURCE_FILE_PATH__', srcPath)
        .replace('__TARGET_FILE_NAME__', path.basename(srcPath))
    )
  }]
})
```

### verbose

Type: `boolean` | Default: `false`

Output copied items to console.

```js
copy({
  targets: [{ src: 'assets/*', dest: 'dist/public' }],
  verbose: true
})
```

### hook

Type: `string` | Default: `buildEnd`

[Rollup hook](https://rollupjs.org/guide/en/#hooks) the plugin should use. By default, plugin runs when rollup has finished bundling, before bundle is written to disk.

```js
copy({
  targets: [{ src: 'assets/*', dest: 'dist/public' }],
  hook: 'writeBundle'
})
```

### watchHook

Type: `string` | Default: `buildStart`

[Rollup hook](https://rollupjs.org/guide/en/#hooks) the [this.addWatchFile](https://rollupjs.org/guide/en/#thisaddwatchfileid-string--void) should call. By default, `addWatchFile` called on each rollup.rollup build.
Only be used in hooks during the build phase, i.e. in `buildStart`, `load`, `resolveId`, and `transform`.

```js
copy({
  targets: [{ src: 'assets/*', dest: 'dist/public' }],
  watchHook: 'resolveId'
})
```


### copyOnce

Type: `boolean` | Default: `false`

Copy items once. Useful in watch mode.

```js
copy({
  targets: [{ src: 'assets/*', dest: 'dist/public' }],
  copyOnce: true
})
```

### flatten

Type: `boolean` | Default: `true`

Remove the directory structure of copied files.

```js
copy({
  targets: [{ src: 'assets/**/*', dest: 'dist/public' }],
  flatten: false
})
```

### globbyOptions

See [globby](https://github.com/sindresorhus/globby)

```js
copy({
  targets: [{ src: 'src/assets/**/*.js', dest: 'dist' }],
  globbyOptions: {
    ignore: ['**/asset-1.js'],
  },
})
```

### fsOptions

```js
copy({
  targets: [{ src: 'src/assets/**/*.js', dest: 'dist' }],
  fsOptions: {
    copy: {} // Options of 'node:fs'.copy
    writeFile: { // Options of 'node:fs'.outputFile
      encoding: 'utf-8'
    }
  }
})
```

## Thanks Original Authors

  * [Cédric Meuter](https://github.com/meuter)
  * [vladshcherbin](https://github.com/vladshcherbin)

## Related

* [@guanghechen/rollup-config][]


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/rollup-plugin-copy@6.0.3/packages/rollup-plugin-copy#readme
[@guanghechen/rollup-config]: https://www.npmjs.com/package/@guanghechen/rollup-config
[@guanghechen/rollup-plugin-copy]: https://www.npmjs.com/package/@guanghechen/rollup-plugin-copy

