const { locateNearestFilepath } = require('@guanghechen/locate-helper')
const fs = require('fs-extra')
const path = require('path')
const {
  collectAllDependencies,
  createDependencyFields,
  detectMonorepo,
  detectPackageAuthor,
} = require('../index')

// Resolve fixture filepath
const resolveFixturePath = p => path.join(__dirname, 'fixtures', p)

describe('util', function () {
  test('detectMonorepo', async function () {
    expect(detectMonorepo(__dirname)).toBeTruthy()

    const lernaFilepath = locateNearestFilepath(__dirname, 'lerna.json')
    const bakFilepath = lernaFilepath + '.bak'

    if (lernaFilepath != null) {
      fs.moveSync(lernaFilepath, bakFilepath)
    }

    try {
      expect(detectMonorepo(resolveFixturePath('monorepo1'))).toBeTruthy()
      expect(detectMonorepo(resolveFixturePath('monorepo2'))).toBeTruthy()
      expect(detectMonorepo(resolveFixturePath('normal-repo'))).toBeFalsy()
    } finally {
      if (lernaFilepath != null) {
        fs.moveSync(bakFilepath, lernaFilepath)
      }
    }
  })

  test('detectPackageAuthor', function () {
    expect(detectPackageAuthor(__dirname)).toEqual('guanghechen')
    expect(detectPackageAuthor(resolveFixturePath('monorepo1'))).toEqual('guanghechen')
    expect(detectPackageAuthor(resolveFixturePath('monorepo2'))).toEqual('waw')
    expect(detectPackageAuthor(resolveFixturePath('normal-repo'))).toBeNull()
  })
})

describe('dependency', function () {
  test('createDependencyFields', function () {
    expect(createDependencyFields()).toEqual([
      'dependencies',
      'optionalDependencies',
      'peerDependencies',
    ])
  })

  test('collectAllDependencies', function () {
    expect(collectAllDependencies(path.join(__dirname, '../package.json'))).toMatchSnapshot(
      'current repo',
    )
    expect(
      collectAllDependencies(
        resolveFixturePath('monorepo2/package.json'),
        undefined,
        ['rollup'],
        () => true,
      ),
    ).toMatchSnapshot('monorepo2')

    const warningDataList = []
    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation((...args) => void warningDataList.push(...args))
    expect(
      collectAllDependencies(resolveFixturePath('normal-repo/package.json'), ['peerDependencies']),
    ).toMatchSnapshot('normal-repo')
    expect(warningDataList).toMatchSnapshot('normal-repo -- warnings')
    warnSpy.mockRestore()
  })
})
