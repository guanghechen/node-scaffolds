import { calcMac, createRandomIv, createRandomKey } from '../src'

describe('createRandomIv', function () {
  test('basic', function () {
    const size = 32
    const buffers = Array.from(Array(size)).map(() => createRandomIv())
    for (let i = 0; i < size; ++i) {
      const buffer1 = buffers[i]
      for (let j = i + 1; j < size; ++j) {
        const buffer2 = buffers[j]
        expect(buffer1.toString()).not.toEqual(buffer2.toString())
      }
    }
  })
})

describe('createRandomKey', function () {
  test('basic', function () {
    const size = 32
    const buffers = Array.from(Array(size)).map(() => createRandomKey())
    for (let i = 0; i < size; ++i) {
      const buffer1 = buffers[i]
      for (let j = i + 1; j < size; ++j) {
        const buffer2 = buffers[j]
        expect(buffer1.toString()).not.toEqual(buffer2.toString())
      }
    }
  })
})

describe('calcMac', function () {
  test('basic', function () {
    const size = 32
    const contents: Buffer[] = Array.from(Array(size)).map(() =>
      createRandomIv(Math.random() * 48 + 16),
    )

    const mac1 = calcMac(...contents)
    for (let i = 0; i < 10; ++i) {
      const mac2 = calcMac(...contents)
      expect(mac1.toString()).toEqual(mac2.toString())
    }
  })
})
