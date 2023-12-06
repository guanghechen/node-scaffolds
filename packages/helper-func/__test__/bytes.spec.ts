import { parseBytesString } from '../src'

describe('parseBytesString', () => {
  it('pure number', () => {
    expect(parseBytesString('1234')).toEqual(1234)
    expect(parseBytesString('1234.2')).toEqual(1234)
    expect(parseBytesString('-1234')).toEqual(0)
    expect(parseBytesString('0')).toEqual(0)
  })

  it('invalid string', () => {
    expect(parseBytesString('1234s')).toEqual(0)
    expect(parseBytesString('1234k')).toEqual(0)
    expect(parseBytesString('1234m')).toEqual(0)
    expect(parseBytesString('1234g')).toEqual(0)
    expect(parseBytesString('1234t')).toEqual(0)
    expect(parseBytesString('1234p')).toEqual(0)
  })

  it('with unit', () => {
    expect(parseBytesString('120K')).toEqual(120 * 1024)
    expect(parseBytesString('2.3M')).toEqual(Math.floor(2.3 * 1024 * 1024))
    expect(parseBytesString('2M')).toEqual(Math.floor(2 * 1024 * 1024))
    expect(parseBytesString('2.2G')).toEqual(Math.floor(2.2 * 1024 * 1024 * 1024))
    expect(parseBytesString('2G')).toEqual(Math.floor(2 * 1024 * 1024 * 1024))
    expect(parseBytesString('130.2T')).toEqual(Math.floor(130.2 * 1024 * 1024 * 1024 * 1024))
    expect(parseBytesString('130T')).toEqual(Math.floor(130 * 1024 * 1024 * 1024 * 1024))
    expect(parseBytesString('2.1P')).toEqual(Math.floor(2.1 * 1024 * 1024 * 1024 * 1024 * 1024))
    expect(parseBytesString('3P')).toEqual(Math.floor(3 * 1024 * 1024 * 1024 * 1024 * 1024))
  })
})
