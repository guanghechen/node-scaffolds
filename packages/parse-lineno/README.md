<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/node-scaffolds/tree/main/packages/parse-lineno#readme">@guanghechen/parse-lineno</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@guanghechen/parse-lineno">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@guanghechen/parse-lineno.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/parse-lineno">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@guanghechen/parse-lineno.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@guanghechen/parse-lineno">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@guanghechen/parse-lineno.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/parse-lineno"
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


Parse something like '1,3-10' to numbers or intervals.

## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/parse-lineno
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/parse-lineno
  ```

## Usage

* Parse lineno string into numbers.

  ```typescript
  import { collectNumbers } from '@guanghechen/parse-lineno'

  collectNumbers('')              // => []
  collectNumbers('1')             // => [1]
  collectNumbers('1-3')           // => [1, 2, 3]
  collectNumbers('3,1-2,2,2')     // => [1, 2, 3]
  collectNumbers('3,7-5,2,2')     // => [2, 3, 5, 6, 7]
  collectNumbers('2,1-3')         // => [1, 2, 3]
  collectNumbers('4,1-3')         // => [1, 2, 3, 4]
  collectNumbers('2-4,1-3,5-9')   // => [1, 2, 3, 4, 5, 6, 7, 8, 9]
  collectNumbers('2-4,1-3,6-9')   // => [1, 2, 3, 4, 6, 7, 8, 9]
  ```

* Parse lineno string into intervals.

  ```typescript
  import { collectIntervals } from '@guanghechen/parse-lineno'

  collectIntervals('')              // => []
  collectIntervals('1')             // => [[1, 1]]
  collectIntervals('1-3')           // => [[1, 3]]
  collectIntervals('3,1-2,2,2')     // => [[1, 3]]
  collectIntervals('3,7-5,2,2')     // => [[2, 3], [5, 7]]
  collectIntervals('2,1-3')         // => [[1, 3]]
  collectIntervals('4,1-3')         // => [[1, 4]]
  collectIntervals('2-4,1-3,5-9')   // => [[1, 9]]
  collectIntervals('2-4,1-3,6-9')   // => [[1, 4], [6, 9]]
  ```

* Custom Separator (default is `/[,\s]+/`)

  ```typescript
  collectNumbers('2#4-5#5-8', /#/)    // => [2, 4, 5, 6, 7, 8]

  collectIntervals('2#4-5#5-8', /#/)  // => [[2, 2], [4, 8]]
  ```

[homepage]: https://github.com/guanghechen/node-scaffolds/tree/main/packages/parse-lineno#readme
