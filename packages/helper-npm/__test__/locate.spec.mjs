import path from 'node:path'
import url from 'node:url'
import { locateLatestPackageJson, locateNearestFilepath } from '../src/index.mjs'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

describe('locateNearestFilepath', function () {
  test('single filename', function () {
    expect(locateNearestFilepath(__dirname, 'package.json')).toBe(
      path.join(__dirname, '../package.json'),
    )

    expect(locateNearestFilepath(__dirname, 'yarn.lock')).toBe(
      path.join(__dirname, '../../../yarn.lock'),
    )

    expect(locateNearestFilepath(path.dirname(import.meta.url), 'package.json')).toBe(
      path.join(__dirname, '../package.json'),
    )

    expect(locateNearestFilepath(path.dirname(import.meta.url), 'yarn.lock')).toBe(
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

describe('locateLatestPackageJson', () => {
  test('basic', () => {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
    expect(locateLatestPackageJson(__dirname)).toBe(path.join(__dirname, '../package.json'))
  })
})
