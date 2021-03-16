import {
  composeTextTransformers,
  toSentenceCase,
  toTrim,
} from '@guanghechen/option-helper'
import type { TextTransformer } from '@guanghechen/option-helper'
import type { InputQuestion } from 'inquirer'
import semverRegex from 'semver-regex'
import type { NpmPackagePromptsAnswers } from './types'
import { detectPackageAuthor } from './util'

/**
 * Create an inquirer prompt to ask for npm package name.
 * @param defaultAnswer   Default prompt answer
 * @param transformer     Input transformer
 * @returns
 */
export const createPackageNamePrompt = (
  defaultAnswer?: string,
  transformer: TextTransformer = toTrim,
): InputQuestion<Pick<NpmPackagePromptsAnswers, 'packageName'>> => {
  const prompt: InputQuestion = {
    type: 'input',
    name: 'packageName',
    message: 'package name',
    default: defaultAnswer,
    transformer,
  }
  return prompt
}

/**
 * Create an inquirer prompt to ask for npm package author.
 * @param cwd             Current workspace dir
 * @param defaultAnswer   Default prompt answer
 * @param transformer     Input transformer
 * @returns
 */
export const createPackageAuthorPrompt = (
  cwd: string,
  defaultAnswer?: string,
  transformer: TextTransformer = toTrim,
): InputQuestion<Pick<NpmPackagePromptsAnswers, 'packageAuthor'>> => {
  const prompt: InputQuestion = {
    type: 'input',
    name: 'packageAuthor',
    message: 'author',
    default: (): string | undefined => {
      if (defaultAnswer != null) return defaultAnswer
      const packageAuthor = detectPackageAuthor(cwd)
      return packageAuthor
    },
    transformer,
  }
  return prompt
}

/**
 * Create an inquirer prompt to ask for npm package version.
 * @param defaultAnswer   Default prompt answer
 * @param transformer     Input transformer
 * @returns
 */
export const createPackageVersionPrompt = (
  defaultAnswer?: string,
  transformer: TextTransformer = toTrim,
): InputQuestion<Pick<NpmPackagePromptsAnswers, 'packageVersion'>> => {
  const prompt: InputQuestion = {
    type: 'input',
    name: 'packageVersion',
    message: 'version',
    default: defaultAnswer,
    transformer,
    validate: (text: string): boolean => semverRegex().test(text),
  }
  return prompt
}

/**
 * Create an inquirer prompt to ask for npm package description.
 * @param defaultAnswer   Default prompt answer
 * @param transformer     Input transformer
 * @returns
 */
export const createPackageDescriptionPrompt = (
  defaultAnswer?: string,
  transformer: TextTransformer = composeTextTransformers(
    toTrim,
    toSentenceCase,
  ),
): InputQuestion<Pick<NpmPackagePromptsAnswers, 'packageDescription'>> => {
  const prompt: InputQuestion = {
    type: 'input',
    name: 'packageDescription',
    message: 'description',
    default: defaultAnswer,
    transformer,
  }
  return prompt
}

/**
 * Create an inquirer prompt to ask for npm package location.
 * @param defaultAnswer   Default prompt answer
 * @param transformer     Input transformer
 * @returns
 */
export const createPackageLocationPrompt = (
  isMonorepo: boolean,
  defaultAnswer?: string,
  transformer: TextTransformer = toTrim,
): InputQuestion<Pick<NpmPackagePromptsAnswers, 'packageDescription'>> => {
  type Answers = Pick<
    NpmPackagePromptsAnswers,
    'packageName' | 'packageDescription'
  >

  const prompt: InputQuestion<any> = {
    type: 'input',
    name: 'packageLocation',
    message: ({ packageName }: Answers): string =>
      'location of ' + packageName.trim(),
    default: ({ packageName }: Answers): string => {
      if (defaultAnswer != null) return defaultAnswer
      return isMonorepo
        ? 'packages/' + packageName.replace(/^[^\\/]+[\\/]/, '')
        : packageName.replace(/^@/, '')
    },
    transformer,
  }
  return prompt as InputQuestion
}
