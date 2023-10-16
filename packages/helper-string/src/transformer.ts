import {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  kebabCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase,
} from './vender/change-case'
import { titleCase } from './vender/title-case'

/**
 * Text transformer.
 */
export type ITextTransformer = (text: string) => string

/**
 * Compose multiple ITextTransformer into one.
 * @param transformers
 * @returns
 */
export function composeTextTransformers(
  ...transformers: ReadonlyArray<ITextTransformer>
): ITextTransformer {
  return text => {
    let result = text
    for (const transformer of transformers) {
      result = transformer(result)
    }
    return result
  }
}

/**
 * Transform into a string with the separator
 * denoted by the next word capitalized.
 *
 *   'test string' => 'testString'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#camelcase
 */
export const toCamelCase: ITextTransformer = text => camelCase(text)

/**
 * Transform into a space separated string with each word capitalized.
 *
 *    'test string' => 'Test String'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#capitalCase
 */
export const toCapitalCase: ITextTransformer = text => capitalCase(text)

/**
 * Transform into upper case string with an underscore between words.
 *
 *    'test string' => 'TEST_STRING'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#constantCase
 */
export const toConstantCase: ITextTransformer = text => constantCase(text)

/**
 * Transform into a lower case string with a period between words.
 *
 *    'test string' => 'test.string'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#dotcase
 */
export const toDotCase: ITextTransformer = text => dotCase(text)

/**
 * Transform into a lower cased string with dashes between words.
 *
 *    'test string' => 'test-string'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#paramcase
 */
export const toKebabCase: ITextTransformer = text => kebabCase(text)

/**
 * Transforms the string to lower case.
 *
 *    'TEST STRING' => 'test string'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#lowerCase
 */
export const toLowerCase: ITextTransformer = text => text.toLocaleLowerCase()

/**
 * Transform into a string of capitalized words without separators.
 *
 *    'test string' => 'TestString'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#pascalcase
 */
export const toPascalCase: ITextTransformer = text => pascalCase(text)

/**
 * Transform into a lower case string with slashes between words.
 *
 *    'test string' => 'test/string'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#pathcase
 */
export const toPathCase: ITextTransformer = text => pathCase(text)

/**
 * Transform into a lower case with spaces between words,
 * then capitalize the string.
 *
 *    'testString' => 'Test string'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#sentencecase
 */
export const toSentenceCase: ITextTransformer = text => sentenceCase(text)

/**
 * Transform into a lower case string with underscores between words.
 *
 *    'test string' => 'test_string'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#snakeCase
 */
export const toSnakeCase: ITextTransformer = text => snakeCase(text)

/**
 * Transform a string into title case following English rules.
 *
 *    'a simple test' => 'A Simple Test'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#titlecase
 */
export const toTitleCase: ITextTransformer = text => titleCase(text)

/**
 * Perform trim operation
 *
 *    ' a simple test  ' => 'a simple test'
 *
 * @param text
 * @returns
 */
export const toTrim: ITextTransformer = text => text.trim()

/**
 * Transforms the string to upper case.
 *
 *    'test string' => 'TEST STRING'
 *
 * @param text
 * @see https://github.com/blakeembrey/change-case#upperCase
 */
export const toUpperCase: ITextTransformer = text => text.toLocaleUpperCase()
