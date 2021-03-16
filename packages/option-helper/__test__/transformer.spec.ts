import { composeTextTransformers, toKebabCase, toTrim } from '../src'

describe('composeTextTransformers', function () {
  test('trim and kebab', function () {
    const transform = composeTextTransformers(toTrim, toKebabCase)
    const text: string = transform(' TeSt_StrinG ')
  })
})
