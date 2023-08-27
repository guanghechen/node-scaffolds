<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/utility-types@5.0.6/packages/utility-types#readme">@guanghechen/utility-types</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/utility-types">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/utility-types.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/utility-types">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/utility-types.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/utility-types">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/utility-types.svg"
      />
    </a>
    <a href="#install">
      <img
        alt="Module Formats: cjs, esm"
        src="https://img.shields.io/badge/module_formats-cjs%2C%20esm-green.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/utility-types"
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


Collection of typescript utility types. Borrowing from the repository [utility-types](https://github.com/piotrwitek/utility-types).

## Usage

* [Diff](#Diff)
* [Mutable](#Mutable)
* [PickPartial](#PickPartial)


### Diff

Remove properties that exist in `U` from `T`.

```typescript
import { Diff } from '@guanghechen/utility-types'

type Props = { name: string, age: number, visible: boolean }
type DefaultProps = { age: number }

type RequiredProps = Diff<Props, DefaultProps>
// => { name: string, visible: boolean }
```

### Mutable

Make all properties in `T` mutable.

```typescript
import { Mutable } from '@guanghechen/utility-types'

type Props = {
  readonly name: string
  readonly age: number
  readonly visible: boolean
}

type MutableProps = Mutable<Props>
// => { name: string, age: number, visible: boolean }
```

### PickPartial

Make a set of properties by key `K` become optional from `T`.

```typescript
import { PickPartial } from '@guanghechen/utility-types'

type Props = {
  name: string
  age: number
  visible: boolean
}

type PartialProps = PickPartial<Props>
// => { name?: string, age?: number, visible?: boolean }

type PartialProps2 = PickPartial<Props, 'name'>
// => { name?: string, age: number, visible: boolean }
```

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/utility-types
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/utility-types
  ```

## Usage


## Related


[homepage]: https://github.com/guanghechen/node-scaffolds/tree/@guanghechen/utility-types@5.0.6/packages/utility-types#readme
