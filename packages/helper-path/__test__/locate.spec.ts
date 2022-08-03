import path from 'path'
import { findNearestFilepath, locateNearestFilepath } from '../src'

describe('locateNearestFilepath', function () {
  test('single filename', function () {
    expect(locateNearestFilepath(__dirname, 'package.json')).toBe(
      path.join(__dirname, '../package.json'),
    )

    expect(locateNearestFilepath(__dirname, 'yarn.lock')).toBe(
      path.join(__dirname, '../../../yarn.lock'),
    )
  })

  test('multiple filenames', function () {
    expect(locateNearestFilepath(__dirname, ['package.json'])).toBe(
      path.join(__dirname, '../package.json'),
    )

    expect(locateNearestFilepath(__dirname, ['package.json', 'yarn.lock'])).toBe(
      path.join(__dirname, '../package.json'),
    )

    expect(locateNearestFilepath(__dirname, ['yarn.lock', 'package.json'])).toBe(
      path.join(__dirname, '../package.json'),
    )

    expect(locateNearestFilepath(__dirname, ['yarn.lock', '.editorconfig'])).toBe(
      path.join(__dirname, '../../../yarn.lock'),
    )
  })

  test('not found', function () {
    expect(locateNearestFilepath(__dirname, '.xx.yy.zz....xxx' + Math.random())).toBeNull()
  })
})

describe('findNearestFilepath', function () {
  test('basic', function () {
    expect(findNearestFilepath(__dirname, p => path.basename(p) === 'package.json')).toBe(
      path.join(__dirname, '../package.json'),
    )
  })

  test('not found', function () {
    expect(findNearestFilepath(__dirname, () => false)).toBeNull()
  })
})
