import {
  composeTextTransformers,
  toKebabCase,
  toLowerCase,
  toTrim,
} from '../src'

describe('composeTextTransformers', function () {
  test('trim and lower, then kebab', function () {
    const transform = composeTextTransformers(toTrim, toLowerCase, toKebabCase)
    const text: string = transform(' TeSt_StrinG ')
    expect(text).toEqual('test-string')
  })
})
