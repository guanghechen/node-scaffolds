import path from 'node:path'
import url from 'node:url'
import { fileSnapshot } from '../src'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

describe('fileSnapshot', function () {
  test('basic', function () {
    fileSnapshot(path.join(__dirname, 'fixtures'), ['data1.json'])
  })

  test('with desensitize', function () {
    fileSnapshot(path.join(__dirname, 'fixtures'), ['data1.json'], text =>
      text
        .replace(/1/g, '-one')
        .replace(/2/g, '-two')
        .replace(/3/g, '-three')
        .replace(/4/g, '-four'),
    )
  })
})
