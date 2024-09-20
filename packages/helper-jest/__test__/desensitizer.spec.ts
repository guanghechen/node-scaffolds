import { isSymbol } from '@guanghechen/is'
import {
  composeStringDesensitizers,
  createFilepathDesensitizer,
  createJsonDesensitizer,
  createPackageVersionDesensitizer,
} from '../src'

describe('createFilepathDesensitizer', () => {
  it('*nix', () => {
    const desensitize = createFilepathDesensitizer('/a/b/c')
    expect(desensitize('sfe /a/b/c/d')).toEqual('sfe <WORKSPACE>/d')
    expect(desensitize('sfe /a\\b/c/d')).toEqual('sfe <WORKSPACE>/d')
  })

  it('windows', () => {
    const desensitize = createFilepathDesensitizer('C:\\a\\b\\c')
    expect(desensitize('sfe C:\\a\\b\\c\\d')).toEqual('sfe <WORKSPACE>\\d')
  })
})

describe('createPackageVersionDesensitizer', () => {
  it('basic', () => {
    const desensitize = createPackageVersionDesensitizer(() => '1.0.0-alpha')

    expect(desensitize('"@guanghechen/test-waw": "^0.1.0"')).toEqual(
      '"@guanghechen/test-waw": "^1.0.0-alpha"',
    )
    expect(desensitize('"@guanghechen/test-waw": "0.1.0"')).toEqual(
      '"@guanghechen/test-waw": "1.0.0-alpha"',
    )
    expect(desensitize('"@guanghechen/waw": "^0.1.0"')).toEqual(
      '"@guanghechen/waw": "^1.0.0-alpha"',
    )

    expect(desensitize('^0.1.0', '@guanghechen/test-waw')).toEqual('^1.0.0-alpha')
    expect(desensitize('~0.1.0', '@guanghechen/test-waw')).toEqual('~1.0.0-alpha')
    expect(desensitize('0.1.0', '@guanghechen/test-waw')).toEqual('1.0.0-alpha')
    expect(desensitize('^0.1.0', '@guanghechen/waw')).toEqual('^1.0.0-alpha')
    expect(desensitize('~0.1.0', '@guanghechen/waw')).toEqual('~1.0.0-alpha')
    expect(desensitize('0.1.0', '@guanghechen/waw')).toEqual('1.0.0-alpha')
  })

  it('custom testPackageName', () => {
    const desensitize = createPackageVersionDesensitizer(
      () => '1.0.0-alpha',
      packageName => /^@guanghechen\/test/.test(packageName),
    )

    expect(desensitize('"@guanghechen/test-waw": "^0.1.0"')).toEqual(
      '"@guanghechen/test-waw": "^1.0.0-alpha"',
    )
    expect(desensitize('"@guanghechen/test-waw": "0.1.0"')).toEqual(
      '"@guanghechen/test-waw": "1.0.0-alpha"',
    )
    expect(desensitize('"@guanghechen/waw": "^0.1.0"')).toEqual('"@guanghechen/waw": "^0.1.0"')

    expect(desensitize('^0.1.0', '@guanghechen/test-waw')).toEqual('^1.0.0-alpha')
    expect(desensitize('~0.1.0', '@guanghechen/test-waw')).toEqual('~1.0.0-alpha')
    expect(desensitize('0.1.0', '@guanghechen/test-waw')).toEqual('1.0.0-alpha')
    expect(desensitize('^0.1.0', '@guanghechen/waw')).toEqual('^0.1.0')
    expect(desensitize('~0.1.0', '@guanghechen/waw')).toEqual('~0.1.0')
    expect(desensitize('0.1.0', '@guanghechen/waw')).toEqual('0.1.0')
  })
})

describe('composeStringDesensitizers', () => {
  it('basic', () => {
    const desensitize = composeStringDesensitizers(
      text => text.replace(/(?<=^|\b)alpha(?=\b|$)/gi, 'α'),
      text => text.replace(/(?<=^|\b)beta(?=\b|$)/gi, 'β'),
    )

    expect(desensitize('alphabeta')).toEqual('alphabeta')
    expect(desensitize('alpha beta')).toEqual('α β')
    expect(desensitize('beta beta alpha beta alpha')).toEqual('β β α β α')
  })
})

describe('createJsonDesensitizer', () => {
  it('basic', () => {
    const desensitize = createJsonDesensitizer(
      {
        string: text => text.replace(/(?<=^|\b)alpha(?=\b|$)/gi, 'α'),
        number: value => Math.abs(value),
        fallback: value => null,
      },
      text => '$' + text,
    )

    expect(
      desensitize({
        name: 'alpha and beta',
        age: -20,
        gender: Symbol('female'),
        favorites: ['apple', 'cat', 'alpha', 'beta'],
      }),
    ).toEqual({
      $name: 'α and beta',
      $age: 20,
      $gender: null,
      $favorites: ['apple', 'cat', 'α', 'beta'],
    })
  })

  it('default', () => {
    const desensitize = createJsonDesensitizer()
    const gender = Symbol('female')
    expect(
      desensitize({
        name: 'alpha and beta',
        age: -20,
        gender,
        favorites: ['apple', 'cat', 'alpha', 'beta'],
      }),
    ).toEqual({
      name: 'alpha and beta',
      age: -20,
      gender,
      favorites: ['apple', 'cat', 'alpha', 'beta'],
    })
  })

  it('fallback', () => {
    const desensitize = createJsonDesensitizer({
      fallback: data => (isSymbol(data) ? null : data),
    })
    expect(
      desensitize({
        name: 'alpha and beta',
        age: -20,
        favorites: ['apple', 'cat', 'alpha', Symbol('beta')],
        gender: Symbol('female'),
      }),
    ).toEqual({
      name: 'alpha and beta',
      age: -20,
      favorites: ['apple', 'cat', 'alpha', null],
      gender: null,
    })
  })
})
