import {
  BigFileHelper,
  calcFilePartItemsByCount,
} from '@guanghechen/file-helper'
import fs from 'fs-extra'
import { locateFixtures, unlinkSync } from 'jest.setup'
import { destroyBuffer, destroyBuffers, streams2buffer } from '../src'

describe('destroyBuffer', function () {
  test('basic', function () {
    expect(() => destroyBuffer(null)).not.toThrow()

    const content = 'waw'
    const buffer: Buffer = Buffer.from(content)

    expect(buffer.toString()).toEqual(content)
    destroyBuffer(buffer)
    expect(buffer.toString()).not.toEqual(content)
  })
})

describe('destroyBuffers', function () {
  test('basic', function () {
    expect(() => destroyBuffers(null)).not.toThrow()
    expect(() => destroyBuffers([null])).not.toThrow()
    expect(() => destroyBuffers([])).not.toThrow()

    const contents: string[] = ['waw', 'wu wa wu', 'guanghechen']
    const buffers: Buffer[] = contents.map(content => Buffer.from(content))

    for (let i = 0; i < contents.length; ++i) {
      const buffer: Buffer = buffers[i]
      const content: string = contents[i]
      expect(buffer.toString()).toEqual(content)
    }
    destroyBuffers(buffers)

    for (let i = 0; i < contents.length; ++i) {
      const buffer: Buffer = buffers[i]
      const content: string = contents[i]
      expect(buffer.toString()).not.toEqual(content)
    }
  })
})

describe('streams2buffer', function () {
  const encoding = 'utf-8'
  const fileHelper = new BigFileHelper({ encoding })
  const sourceFilepath = locateFixtures('basic/big-file.md')
  const originalContent = fs.readFileSync(sourceFilepath, encoding)
  let partFilepaths: string[] = []

  beforeAll(async function () {
    partFilepaths = await fileHelper.split(
      sourceFilepath,
      calcFilePartItemsByCount(sourceFilepath, 5),
    )
  })

  afterAll(() => {
    unlinkSync(partFilepaths)
  })

  test('basic', async function () {
    const streams: fs.ReadStream[] = partFilepaths.map(p =>
      fs.createReadStream(p),
    )
    const buffer: Buffer = await streams2buffer(streams)
    expect(buffer.toString(encoding)).toEqual(originalContent)
  })
})
