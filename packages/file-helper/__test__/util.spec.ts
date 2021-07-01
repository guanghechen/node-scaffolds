import { locateFixtures } from 'jest.setup'
import { calcFilePartItemsByCount, calcFilePartItemsBySize } from '../src'

describe('calcFilePartItemsByCount', function () {
  test('basic', function () {
    const filepath = locateFixtures('a.md')
    expect(calcFilePartItemsByCount(filepath, 4)).toMatchSnapshot()
  })
})

describe('calcFilePartItemsBySize', function () {
  test('basic', function () {
    const filepath = locateFixtures('a.md')
    expect(calcFilePartItemsBySize(filepath, 1024)).toMatchSnapshot()
  })
})
