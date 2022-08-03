import { desensitize, locateFixtures } from 'jest.helper'
import path from 'path'
import { collectAllDependencies, getDefaultDependencyFields } from '../src'

describe('getDefaultDependencyFields', () => {
  test('basic', () => {
    expect(getDefaultDependencyFields()).toEqual([
      'dependencies',
      'optionalDependencies',
      'peerDependencies',
    ])
  })
})

describe('collectAllDependencies', () => {
  test('basic', function () {
    expect(collectAllDependencies(path.join(__dirname, '../package.json'))).toMatchSnapshot(
      'current repo',
    )
    expect(
      collectAllDependencies(
        locateFixtures('monorepo2/package.json'),
        undefined,
        ['rollup'],
        () => true,
      ),
    ).toMatchSnapshot('monorepo2')

    const warningDataList: unknown[] = []
    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation((...args) => void warningDataList.push(...args))
    expect(
      collectAllDependencies(locateFixtures('normal-repo/package.json'), ['peerDependencies']),
    ).toMatchSnapshot('normal-repo')
    expect(desensitize(warningDataList)).toMatchSnapshot('normal-repo -- warnings')
    warnSpy.mockRestore()
  })
})
