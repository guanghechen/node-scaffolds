import { tagNamePattern } from '../src'

describe('tagNamePattern', () => {
  const regex = new RegExp('^' + tagNamePattern + '$')

  it('basic', () => {
    expect(regex.test('v1.0.0')).toEqual(true)
    expect(regex.test('v4.0.0-alpha.2')).toEqual(true)
    expect(regex.test('@guanghechen/invariant@5.0.0')).toEqual(true)
    expect(regex.test('release-5.x.x')).toEqual(true)
  })
})
