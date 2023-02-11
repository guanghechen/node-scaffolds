import { randomBytes } from 'node:crypto'
import { calcMac, calcMacFromString, destroyBuffer, destroyBuffers } from '../src'

describe('util', () => {
  test('calcMac', () => {
    const size = 32
    const contents: Buffer[] = Array.from(Array(size)).map(() =>
      randomBytes(Math.random() * 48 + 16),
    )

    const mac1 = calcMac(...contents)
    for (let i = 0; i < 10; ++i) {
      const mac2 = calcMac(...contents)
      expect(mac1.toString()).toEqual(mac2.toString())
    }
  })

  test('calcMacFromString', () => {
    expect(calcMacFromString('hello, world!', 'utf8').toString('base64')).toEqual(
      'aOZWslHmfoNYvvhIOrDVHGYZ8+ehqfDnWDjUH/No9yg=',
    )
  })

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
})
