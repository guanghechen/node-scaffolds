import {
  TextTransformerBuilder,
  isString,
  textTransformers,
} from '@guanghechen/option-helper'
import type { TextTransformer } from '@guanghechen/option-helper'
import fs from 'fs-extra'
import type { InputQuestion } from 'inquirer'
import path from 'path'
import semverRegex from 'semver-regex'

/**
 * Create an inquirer prompt to ask for npm package name.
 * @param defaultAnswer   Default prompt answer
 * @param transformer     Input transformer
 * @returns
 */
export const createPackageNamePrompt = (
  defaultAnswer?: string,
  transformer: TextTransformer = textTransformers.trim,
): InputQuestion<{ packageName: string }> => {
  const prompts: InputQuestion = {
    type: 'input',
    name: 'packageName',
    message: 'package name',
    default: defaultAnswer,
    transformer,
  }
  return prompts
}

/**
 * Create an inquirer prompt to ask for npm package author.
 * @param cwd             Current workspace directory
 * @param defaultAnswer   Default prompt answer
 * @param transformer     Input transformer
 * @returns
 */
export const createPackageAuthorPrompt = (
  cwd: string,
  defaultAnswer?: string,
  transformer: TextTransformer = textTransformers.trim,
): InputQuestion<{ packageAuthor: string }> => {
  const prompts: InputQuestion = {
    type: 'input',
    name: 'packageAuthor',
    message: 'author',
    default: (): string | undefined => {
      // detect package.json
      const manifestFilepath = path.resolve(cwd, 'package.json')
      if (fs.existsSync(manifestFilepath)) {
        const manifest = fs.readJSONSync(manifestFilepath)
        if (manifest.author != null) {
          if (isString(manifest.author)) return manifest.author
          if (typeof manifest.author.name === 'string')
            return manifest.author.name
        }
      }
      return defaultAnswer
    },
    transformer,
  }
  return prompts
}

/**
 * Create an inquirer prompt to ask for npm package version.
 * @param defaultAnswer   Default prompt answer
 * @param transformer     Input transformer
 * @returns
 */
export const createPackageVersionPrompt = (
  defaultAnswer?: string,
  transformer: TextTransformer = textTransformers.trim,
): InputQuestion<{ packageVersion: string }> => {
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
  transformer: TextTransformer = new TextTransformerBuilder().trim.capital.build(),
): InputQuestion<{ packageDescription: string }> => {
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
export const createPackageLocation = (
  isMonorepo: boolean,
  defaultAnswer?: string,
  transformer: TextTransformer = new TextTransformerBuilder().trim.capital.build(),
): InputQuestion<{ packageDescription: string }> => {
  const prompt: InputQuestion = {
    type: 'input',
    name: 'packageLocation',
    message: ({ packageName }: any): string =>
      'location of ' + packageName.trim(),
    default: ({ packageName }: any): string => {},
    transformer,
  }
  return prompt
}
