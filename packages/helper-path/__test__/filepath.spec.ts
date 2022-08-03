import { desensitize } from 'jest.helper'
import path from 'path'
import { absoluteOfWorkspace, relativeOfWorkspace } from '../src'

describe('absoluteOfWorkspace', function () {
  test('null / undefined', function () {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(absoluteOfWorkspace(__dirname, null)).toEqual(__dirname)

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(absoluteOfWorkspace(__dirname, undefined)).toEqual(__dirname)

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(absoluteOfWorkspace(__dirname)).toEqual(__dirname)
  })

  test('basic', function () {
    expect(desensitize(absoluteOfWorkspace(__dirname, 'a/b/c.txt'))).toEqual(
      '<$WORKSPACE$>/packages/helper-path/__test__/a/b/c.txt',
    )
    expect(desensitize(absoluteOfWorkspace(__dirname, '/a/b/c.txt'))).toEqual('/a/b/c.txt')
    expect(desensitize(absoluteOfWorkspace(__dirname, path.join(__dirname, '/a/b/c.txt')))).toEqual(
      '<$WORKSPACE$>/packages/helper-path/__test__/a/b/c.txt',
    )
  })
})

describe('relativeOfWorkspace', function () {
  test('basic', function () {
    expect(desensitize(relativeOfWorkspace(__dirname, path.join(__dirname, 'a/b/c.txt')))).toEqual(
      'a/b/c.txt',
    )
    expect(
      desensitize(relativeOfWorkspace(__dirname, path.join(__dirname, '../a/b/c.txt'))),
    ).toEqual('../a/b/c.txt')
    expect(desensitize(relativeOfWorkspace(__dirname, path.join(__dirname, '../..')))).toEqual(
      '../..',
    )
  })
})
