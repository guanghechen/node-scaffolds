import * as changeCase from 'change-case'
import { lowerCase } from 'lower-case'
import { titleCase } from 'title-case'
import { upperCase } from 'upper-case'

/**
 * Transforms the string to lower case.
 *
 *    'TEST STRING' => 'test string'
 *
 * @param s
 * @see https://github.com/blakeembrey/change-case#lowerCase
 */
export function toLowerCase(s: string): string {
  return lowerCase(s)
}

/**
 * Transforms the string to upper case.
 *
 *    'test string' => 'TEST STRING'
 *
 * @param s
 * @see https://github.com/blakeembrey/change-case#upperCase
 */
export function toUpperCase(s: string): string {
  return upperCase(s)
}

/**
 * Transform into a space separated string with each word capitalized.
 *
 *    'test string' => 'Test String'
 *
 * @param s
 * @see https://github.com/blakeembrey/change-case#capitalCase
 */
export function toCapitalCase(s: string): string {
  return changeCase.capitalCase(s)
}

/**
 * Transform into a string of capitalized words without separators.
 *
 *    'test string' => 'TestString'
 *
 * @param s
 * @see https://github.com/blakeembrey/change-case#pascalcase
 */
export function toPascalCase(s: string): string {
  return changeCase.pascalCase(s)
}

/**
 * Transform into a string with the separator
 * denoted by the next word capitalized.
 *
 *   'test string' => 'testString'
 *
 * @param s
 * @see https://github.com/blakeembrey/change-case#camelcase
 */
export function toCamelCase(s: string): string {
  return changeCase.camelCase(s)
}

/**
 * Transform into upper case string with an underscore between words.
 *
 *    'test string' => 'TEST_STRING'
 *
 * @param s
 * @see https://github.com/blakeembrey/change-case#constantCase
 */
export function toConstantCase(s: string): string {
  return changeCase.constantCase(s)
}

/**
 * Transform into a lower cased string with dashes between words.
 *
 *    'test string' => 'test-string'
 *
 * @param s
 * @see https://github.com/blakeembrey/change-case#paramcase
 */
export function toKebabCase(s: string): string {
  return changeCase.paramCase(s)
}

/**
 * Transform into a lower case string with underscores between words.
 *
 *    'test string' => 'test_string'
 *
 * @param s
 * @see https://github.com/blakeembrey/change-case#snakeCase
 */
export function toSnakeCase(s: string): string {
  return changeCase.snakeCase(s)
}

/**
 * Transform into a lower case string with slashes between words.
 *
 *    'test string' => 'test/string'
 *
 * @param s
 * @see https://github.com/blakeembrey/change-case#pathcase
 */
export function toPathCase(s: string): string {
  return changeCase.pathCase(s)
}

/**
 * Transform into a lower case with spaces between words,
 * then capitalize the string.
 *
 *    'testString' => 'Test string'
 *
 * @param s
 * @see https://github.com/blakeembrey/change-case#sentencecase
 */
export function toSentenceCase(s: string): string {
  return changeCase.sentenceCase(s)
}

/**
 * Transform a string into title case following English rules.
 *
 *    'a simple test' => 'A Simple Test'
 *
 * @param s
 * @see https://github.com/blakeembrey/change-case#titlecase
 */
export function toTitleCase(s: string): string {
  return titleCase(s)
}

/**
 * Transform into a lower case string with a period between words.
 *
 *    'test string' => 'test.string'
 *
 * @param s
 * @see https://github.com/blakeembrey/change-case#dotcase
 */
export function toDotCase(s: string): string {
  return changeCase.dotCase(s)
}
