import { destroyBuffer, destroyBuffers } from '../src'

test('destroyBuffer', function () {
  expect(() => destroyBuffer(null)).not.toThrow()

  const content = 'waw'
  const buffer: Buffer = Buffer.from(content)

  expect(buffer.toString()).toEqual(content)
  destroyBuffer(buffer)
  expect(buffer.toString()).not.toEqual(content)
})

test('destroyBuffers', function () {
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
