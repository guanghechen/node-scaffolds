[![npm version](https://img.shields.io/npm/v/@guanghechen/option-helper.svg)](https://www.npmjs.com/package/@guanghechen/option-helper)
[![npm download](https://img.shields.io/npm/dm/@guanghechen/option-helper.svg)](https://www.npmjs.com/package/@guanghechen/option-helper)
[![npm license](https://img.shields.io/npm/l/@guanghechen/option-helper.svg)](https://www.npmjs.com/package/@guanghechen/option-helper)


# `@guanghechen/option-helper`


## Install

* npm

  ```bash
  npm install --save-dev @guanghechen/option-helper
  ```

* yarn

  ```bash
  yarn add --dev @guanghechen/option-helper
  ```

## Usage


  * `is`

    Name                  | Description
    :--------------------:|:----------------------------------------------------------------
    `isArray`             | Check if the given data is a `Array` type
    `isBigint`            | Check if the given data is a `bigint` type
    `isBoolean`           | Check if the given data is a `boolean` / `Boolean` type
    `isFunction`          | Check if the given data is a `Function` type
    `isInteger`           | Check if the given data is a `Integer` type
    `isNumber`            | Check if the given data is a `number` / `Number` type
    `isObject`            | Check if the given data is a `Object` type
    `isString`            | Check if the given data is a `string` / `String` type
    `isSymbol`            | Check if the given data is a `symbol` type
    `isUndefined`         | Check if the given data is a `undefined` type
    `isPrimitiveBoolean`  | Check if the given data is a `boolean` type
    `isPrimitiveInteger`  | Check if the given data is a `integer` type
    `isPrimitiveNumber`   | Check if the given data is a `number` type
    `isPrimitiveString`   | Check if the given data is a `string` type
    `isNonBlankString`    | Check if the given data is an non-blank `string` / `String` type
    `isNotEmptyArray`     | Check if the given data is an not-empty `Array` type
    `isNotEmptyObject`    | Check if the given data is an not-empty `Object` type
    `isEmptyObject`       | Check if the given data is an empty `Object` type
    `isNumberLike`        | Check if the given data is an `number` / `Number` or number like `string` type


  * `string` utilities

    Name                  | Description
    :--------------------:|:---------------------------------------
    `toLowerCase`         | `'TEST STRING' => 'test string'`
    `toUpperCase`         | `'test string' => 'TEST STRING'`
    `toCapitalCase`       | `'test string' => 'Test String'`
    `toPascalCase`        | `'test string' => 'TestString'`
    `toCamelCase`         | `'test string' => 'testString'`
    `toConstantCase`      | `'test string' => 'TEST_STRING'`
    `toKebabCase`         | `'test string' => 'test-string'`
    `toSnakeCase`         | `'test string' => 'test_string'`
    `toPathCase`          | `'test string' => 'test/string'`
    `toSentenceCase`      | `'testString' => 'Test string'`
    `toTitleCase`         | `'a simple test' => 'A Simple Test'`
    `toDotCase`           | `'test string' => 'test.string'`

  * `cover` utilities

    Name                  | Description
    :--------------------:|:---------------------------------------
    `cover`               | -
    `coverBoolean`        | -
    `coverNumber`         | -
    `coverString`         | -

  * `convert` utilities

    Name                  | Description
    :--------------------:|:---------------------------------------
    `convertToBoolean`    | -
    `convertToNumber`     | -
    `convertToString`     | -
