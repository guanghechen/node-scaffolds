import path from 'node:path'
import url from 'node:url'
import { FileCipherPathResolver } from '../src'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

describe('FileCipherPathResolver', () => {
  const sourceRootDir = path.join(__dirname, 'src')
  const encryptedRootDir = path.join(__dirname, 'lib')
  const pathResolver = new FileCipherPathResolver({ sourceRootDir, encryptedRootDir })

  test('calcAbsoluteSourceFilepath', () => {
    expect(pathResolver.calcAbsoluteSourceFilepath('waw.txt')).toEqual(
      path.join(sourceRootDir, 'waw.txt'),
    )

    expect(pathResolver.calcAbsoluteSourceFilepath(path.join(sourceRootDir, 'waw2.txt'))).toEqual(
      path.join(sourceRootDir, 'waw2.txt'),
    )

    expect(() => pathResolver.calcAbsoluteSourceFilepath('/waw.txt')).toThrow(
      /Not under the sourceRootDir:/,
    )
  })

  test('calcAbsoluteEncryptedFilepath', () => {
    expect(pathResolver.calcAbsoluteEncryptedFilepath('waw.txt')).toEqual(
      path.join(encryptedRootDir, 'waw.txt'),
    )

    expect(
      pathResolver.calcAbsoluteEncryptedFilepath(path.join(encryptedRootDir, 'waw2.txt')),
    ).toEqual(path.join(encryptedRootDir, 'waw2.txt'))

    expect(() => pathResolver.calcAbsoluteEncryptedFilepath('/waw.txt')).toThrow(
      /Not under the encryptedRootDir:/,
    )
  })

  test('calcRelativeSourceFilepath', () => {
    expect(pathResolver.calcRelativeSourceFilepath(path.join(sourceRootDir, 'waw.txt'))).toEqual(
      'waw.txt',
    )

    expect(() => pathResolver.calcRelativeSourceFilepath('/waw.txt')).toThrow(
      /Not under the sourceRootDir:/,
    )
  })

  test('calcRelativeEncryptedFilepath', () => {
    expect(
      pathResolver.calcRelativeEncryptedFilepath(path.join(encryptedRootDir, 'waw.txt')),
    ).toEqual('waw.txt')

    expect(() => pathResolver.calcRelativeEncryptedFilepath('/waw.txt')).toThrow(
      /Not under the encryptedRootDir:/,
    )
  })
})
