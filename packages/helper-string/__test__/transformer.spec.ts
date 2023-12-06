import {
  composeTextTransformers,
  toCamelCase,
  toCapitalCase,
  toConstantCase,
  toDotCase,
  toKebabCase,
  toLowerCase,
  toPascalCase,
  toPathCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
  toTrim,
  toUpperCase,
} from '../src'

describe('string', function () {
  describe('toLowerCase', function () {
    test("'TEST STRING' => 'test string'", () =>
      expect(toLowerCase('TEST STRING')).toEqual('test string'))
  })

  describe('toUpperCase', function () {
    test("'test string' => 'TEST STRING'", () =>
      expect(toUpperCase('test string')).toEqual('TEST STRING'))
  })

  describe('toCapitalCase', function () {
    test("'test string' => 'Test String'", () =>
      expect(toCapitalCase('test string')).toEqual('Test String'))
  })

  describe('toPascalCase', function () {
    test("'test string' => 'TestString'", () =>
      expect(toPascalCase('test string')).toEqual('TestString'))
  })

  describe('toCamelCase', function () {
    test("'test string' => 'testString'", () =>
      expect(toCamelCase('test string')).toEqual('testString'))
  })

  describe('toConstantCase', function () {
    test("'test string' => 'TEST_STRING'", () =>
      expect(toConstantCase('test string')).toEqual('TEST_STRING'))
  })

  describe('toKebabCase', function () {
    test("'test string' => 'test-string'", () =>
      expect(toKebabCase('test string')).toEqual('test-string'))
  })

  describe('toSnakeCase', function () {
    test("'test string' => 'test_string'", () =>
      expect(toSnakeCase('test string')).toEqual('test_string'))
  })

  describe('toPathCase', function () {
    test("'test string' => 'test/string'", () =>
      expect(toPathCase('test string')).toEqual('test/string'))
  })

  describe('toSentenceCase', function () {
    test("'testString' => 'Test string'", () =>
      expect(toSentenceCase('testString')).toEqual('Test string'))
  })

  describe('toTitleCase', function () {
    test("'a simple test' => 'A Simple Test'", () =>
      expect(toTitleCase('a simple test')).toEqual('A Simple Test'))
  })

  describe('toDotCase', function () {
    test("'test string' => 'test.string'", () =>
      expect(toDotCase('test string')).toEqual('test.string'))
  })
})

describe('composeTextTransformers', function () {
  it('trim and lower, then kebab', function () {
    const transform = composeTextTransformers(toTrim, toLowerCase, toKebabCase)
    const text: string = transform(' TeSt_StrinG ')
    expect(text).toEqual('test-string')
  })
})
