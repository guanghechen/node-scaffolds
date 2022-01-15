import * as changeCase from 'change-case'
import { lowerCase } from 'lower-case'
import { titleCase } from 'title-case'
import { upperCase } from 'upper-case'

/**
 * Text transformer.
 */
export type TextTransformer = (text: string) => string

/**
 * Transform into a string with the separator
 * denoted by the next word capitalized.
 *
 *   'test string' => 'testString'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#camelcase
 */
export const toCamelCase: TextTransformer = text => changeCase.camelCase(text)

/**
 * Transform into a space separated string with each word capitalized.
 *
 *    'test string' => 'Test String'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#capitalCase
 */
export const toCapitalCase: TextTransformer = text => changeCase.capitalCase(text)

/**
 * Transform into upper case string with an underscore between words.
 *
 *    'test string' => 'TEST_STRING'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#constantCase
 */
export const toConstantCase: TextTransformer = text => changeCase.constantCase(text)

/**
 * Transform into a lower case string with a period between words.
 *
 *    'test string' => 'test.string'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#dotcase
 */
export const toDotCase: TextTransformer = text => changeCase.dotCase(text)

/**
 * Transform into a lower cased string with dashes between words.
 *
 *    'test string' => 'test-string'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#paramcase
 */
export const toKebabCase: TextTransformer = text => changeCase.paramCase(text)

/**
 * Transforms the string to lower case.
 *
 *    'TEST STRING' => 'test string'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#lowerCase
 */
export const toLowerCase: TextTransformer = text => lowerCase(text)

/**
 * Transform into a string of capitalized words without separators.
 *
 *    'test string' => 'TestString'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#pascalcase
 */
export const toPascalCase: TextTransformer = text => changeCase.pascalCase(text)

/**
 * Transform into a lower case string with slashes between words.
 *
 *    'test string' => 'test/string'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#pathcase
 */
export const toPathCase: TextTransformer = text => changeCase.pathCase(text)

/**
 * Transform into a lower case with spaces between words,
 * then capitalize the string.
 *
 *    'testString' => 'Test string'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#sentencecase
 */
export const toSentenceCase: TextTransformer = text => changeCase.sentenceCase(text)

/**
 * Transform into a lower case string with underscores between words.
 *
 *    'test string' => 'test_string'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#snakeCase
 */
export const toSnakeCase: TextTransformer = text => changeCase.snakeCase(text)

/**
 * Transform a string into title case following English rules.
 *
 *    'a simple test' => 'A Simple Test'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#titlecase
 */
export const toTitleCase: TextTransformer = text => titleCase(text)

/**
 * Perform trim operation
 *
 *    ' a simple test  ' => 'a simple test'
 *
 * @param text
 * @returns
 */
export const toTrim: TextTransformer = text => text.trim()

/**
 * Transforms the string to upper case.
 *
 *    'test string' => 'TEST STRING'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#upperCase
 */
export const toUpperCase: TextTransformer = text => upperCase(text)

/**
 * Compose multiple TextTransformer into one.
 * @param transformers
 * @returns
 */
export function composeTextTransformers(
  ...transformers: ReadonlyArray<TextTransformer>
): TextTransformer {
  return text => {
    let result = text
    for (const transformer of transformers) {
      result = transformer(result)
    }
    return result
  }
}
