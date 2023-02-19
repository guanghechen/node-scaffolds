import { desensitize, emptyDir, locateFixtures, rm } from 'jest.helper'
import path from 'node:path'
import url from 'node:url'
import { FilepathResolver, absoluteOfWorkspace, relativeOfWorkspace } from '../src'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

describe('absoluteOfWorkspace', function () {
  test('null / undefined', function () {
    expect(absoluteOfWorkspace(__dirname, null)).toEqual(__dirname)
    expect(absoluteOfWorkspace(__dirname, undefined)).toEqual(__dirname)
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

describe('FilepathResolver', () => {
  const workspaceDir: string = locateFixtures('__fictitious__.FilepathResolver')
  const pathResolver = new FilepathResolver(workspaceDir)

  beforeEach(async () => {
    await emptyDir(workspaceDir)
  })

  afterEach(async () => {
    await rm(workspaceDir)
  })

  test('absolute', () => {
    expect(pathResolver.absolute('waw.txt')).toEqual(path.join(workspaceDir, 'waw.txt'))

    expect(pathResolver.absolute(path.join(workspaceDir, 'waw2.txt'))).toEqual(
      path.join(workspaceDir, 'waw2.txt'),
    )

    expect(() => pathResolver.absolute('/waw.txt')).toThrow(/Not under the rootDir:/)
  })

  test('relative', () => {
    expect(pathResolver.relative(path.join(workspaceDir, 'waw.txt'))).toEqual('waw.txt')

    expect(() => pathResolver.relative('/waw.txt')).toThrow(/Not under the rootDir:/)
  })
})
