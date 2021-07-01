import path from 'path'
import { absoluteOfWorkspace, relativeOfWorkspace } from '../src'
import { desensitize } from './util'

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
    expect(
      desensitize(absoluteOfWorkspace(__dirname, 'a/b/c.txt')),
    ).toMatchSnapshot()
    expect(
      desensitize(absoluteOfWorkspace(__dirname, '/a/b/c.txt')),
    ).toMatchSnapshot()
    expect(
      desensitize(
        absoluteOfWorkspace(__dirname, path.join(__dirname, '/a/b/c.txt')),
      ),
    ).toMatchSnapshot()
  })
})

describe('relativeOfWorkspace', function () {
  test('basic', function () {
    expect(
      desensitize(
        relativeOfWorkspace(__dirname, path.join(__dirname, 'a/b/c.txt')),
      ),
    ).toMatchSnapshot()
    expect(
      desensitize(
        relativeOfWorkspace(__dirname, path.join(__dirname, '../a/b/c.txt')),
      ),
    ).toMatchSnapshot()
    expect(
      desensitize(
        relativeOfWorkspace(__dirname, path.join(__dirname, '../..')),
      ),
    ).toMatchSnapshot()
  })
})
