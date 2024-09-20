import { composeTextTransformers, toSentenceCase, toTrim } from '@guanghechen/string'
import type { ITextTransformer } from '@guanghechen/string'
import type { InputQuestion } from 'inquirer'
import type { INpmPackagePromptsAnswers } from './types'

// @see https://github.com/sindresorhus/semver-regex
const semverRegex =
  /(?<=^v?|\sv?)(?:(?:0|[1-9]\d*)\.){2}(?:0|[1-9]\d*)(?:-(?:0|[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*)(?:\.(?:0|[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*))*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?\b/i

/**
 * Create an inquirer prompt to ask for npm package name.
 * @param defaultAnswer   Default prompt answer
 * @param transformer     Input transformer
 * @returns
 */
export async function createPackageNamePrompt(
  defaultAnswer?: string,
  transformer: ITextTransformer = toTrim,
): Promise<InputQuestion<Pick<INpmPackagePromptsAnswers, 'packageName'>>> {
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
export async function createPackageAuthorPrompt(
  cwd: string,
  defaultAnswer?: string,
  transformer: ITextTransformer = toTrim,
): Promise<InputQuestion<Pick<INpmPackagePromptsAnswers, 'packageAuthor'>>> {
  const { detectPackageAuthor } = await import('@guanghechen/helper-npm')
  const prompt: InputQuestion = {
    type: 'input',
    name: 'packageAuthor',
    message: 'author',
    default: (): string | null => {
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
export async function createPackageVersionPrompt(
  defaultAnswer?: string,
  transformer: ITextTransformer = toTrim,
): Promise<InputQuestion<Pick<INpmPackagePromptsAnswers, 'packageVersion'>>> {
  const prompt: InputQuestion = {
    type: 'input',
    name: 'packageVersion',
    message: 'version',
    default: defaultAnswer,
    transformer,
    validate: (text: string): boolean => semverRegex.test(text),
  }
  return prompt
}

/**
 * Create an inquirer prompt to ask for npm package description.
 * @param defaultAnswer   Default prompt answer
 * @param transformer     Input transformer
 * @returns
 */
export async function createPackageDescriptionPrompt(
  defaultAnswer?: string,
  transformer: ITextTransformer = composeTextTransformers(toTrim, toSentenceCase),
): Promise<InputQuestion<Pick<INpmPackagePromptsAnswers, 'packageDescription'>>> {
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
export async function createPackageLocationPrompt(
  isMonorepo: boolean,
  defaultAnswer?: string,
  transformer: ITextTransformer = toTrim,
): Promise<InputQuestion<Pick<INpmPackagePromptsAnswers, 'packageDescription'>>> {
  type IAnswers = Pick<INpmPackagePromptsAnswers, 'packageName' | 'packageDescription'>
  const prompt: InputQuestion<any> = {
    type: 'input',
    name: 'packageLocation',
    message: ({ packageName }: IAnswers): string => 'location of ' + packageName.trim(),
    default: ({ packageName }: IAnswers): string => {
      if (defaultAnswer != null) return defaultAnswer
      return isMonorepo
        ? 'packages/' + packageName.replace(/^[^\\/]+[\\/]/, '')
        : packageName.replace(/^@/, '')
    },
    transformer,
  }
  return prompt as InputQuestion
}
