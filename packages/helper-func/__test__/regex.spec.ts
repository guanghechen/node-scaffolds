import { escapeRegexSpecialChars } from '../src'

describe('escapeRegexSpecialChars', () => {
  test('it should escape special regex characters', () => {
    const input = 'hello.world*'
    const expectedOutput = 'hello\\.world\\*'
    const result = escapeRegexSpecialChars(input)
    expect(result).toEqual(expectedOutput)
    expect(new RegExp(result).test(input)).toEqual(true)
  })

  test('it should handle empty input', () => {
    const input = ''
    const expectedOutput = ''
    const result = escapeRegexSpecialChars(input)
    expect(result).toEqual(expectedOutput)
    expect(new RegExp(result).test(input)).toEqual(true)
  })

  test('it should handle input with no special characters', () => {
    const input = 'hello world'
    const expectedOutput = 'hello world'
    const result = escapeRegexSpecialChars(input)
    expect(result).toEqual(expectedOutput)
    expect(new RegExp(result).test(input)).toEqual(true)
  })
})
