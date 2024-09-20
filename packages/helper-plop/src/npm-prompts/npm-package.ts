import { cover } from '@guanghechen/helper-option'
import { composeTextTransformers, toSentenceCase, toTrim } from '@guanghechen/helper-string'
import type { ITextTransformer } from '@guanghechen/helper-string'
import invariant from '@guanghechen/invariant'
import { isNonBlankString } from '@guanghechen/is'
import type { InputQuestion } from 'inquirer'
import path from 'node:path'
import {
  createPackageAuthorPrompt,
  createPackageDescriptionPrompt,
  createPackageLocationPrompt,
  createPackageNamePrompt,
  createPackageVersionPrompt,
} from './prompts'
import type { INpmPackageData, INpmPackagePreAnswers, INpmPackagePromptsAnswers } from './types'
import { resolveRepositoryName } from './util'

// Transformers for npm-package prompts
export const npmPackageTransformers: Record<string, ITextTransformer> = {
  packageName: toTrim,
  packageAuthor: toTrim,
  packageVersion: toTrim,
  packageDescription: composeTextTransformers(toTrim, toSentenceCase),
  packageLocation: toTrim,
}

/**
 * Create a list of inquirer prompts for collecting a NpmPackagePromptsAnswers.
 *
 * @param preAnswers
 * @param defaultAnswers
 * @returns
 */
export async function createNpmPackagePrompts(
  preAnswers: INpmPackagePreAnswers,
  defaultAnswers: Partial<INpmPackagePromptsAnswers> = {},
): Promise<InputQuestion<INpmPackagePromptsAnswers>> {
  const prompts: InputQuestion<INpmPackagePromptsAnswers> = await Promise.all([
    createPackageNamePrompt(defaultAnswers.packageName, npmPackageTransformers.packageName),
    createPackageAuthorPrompt(
      preAnswers.cwd,
      defaultAnswers.packageAuthor,
      npmPackageTransformers.packageAuthor,
    ),
    createPackageVersionPrompt(
      defaultAnswers.packageVersion,
      npmPackageTransformers.packageVersion,
    ),
    createPackageDescriptionPrompt(
      defaultAnswers.packageDescription,
      npmPackageTransformers.packageDescription,
    ),
    createPackageLocationPrompt(
      preAnswers.isMonorepo,
      defaultAnswers.packageLocation,
      npmPackageTransformers.packageLocation,
    ),
  ])
  return prompts
}

/**
 * Resolve pre-answers.
 *
 * @param preAnswers
 * @returns
 */
export async function resolveNpmPackagePreAnswers(
  preAnswers: Partial<INpmPackagePreAnswers> = {},
): Promise<INpmPackagePreAnswers> {
  const cwd: string = cover<string>(() => path.resolve(process.cwd()), preAnswers.cwd)

  const { detectMonorepo } = await import('@guanghechen/helper-npm')
  const isMonorepo: boolean = cover<boolean>(() => detectMonorepo(cwd), preAnswers.isMonorepo)

  const result: INpmPackagePreAnswers = {
    cwd,
    isMonorepo,
  }
  return result
}

/**
 * Resolve answers.
 *
 * @param preAnswers  Pre calculated answers
 * @param answers     Prompts answers
 * @returns
 */
export function resolveNpmPackageAnswers(
  preAnswers: INpmPackagePreAnswers,
  answers: INpmPackagePromptsAnswers,
): INpmPackageData {
  const { cwd, isMonorepo } = preAnswers

  // Resolve prompts answers.
  const packageName: string = npmPackageTransformers.packageName(answers.packageName)
  let packageAuthor: string = npmPackageTransformers.packageAuthor(answers.packageAuthor)
  const packageVersion: string = npmPackageTransformers.packageVersion(answers.packageVersion)
  const packageDescription: string = npmPackageTransformers
    .packageDescription(answers.packageDescription)
    .replace(/[.]?$/, '')
  const packageLocation: string = npmPackageTransformers.packageLocation(answers.packageLocation)

  if (!packageAuthor) {
    const m = /^@([\w.]+)[/\\][^/\\]+$/.exec(packageName)
    if (m != null) packageAuthor = m[1]
  }

  invariant(Boolean(packageAuthor), 'Cannot resolve package author name!!')

  // Resolve additional data.
  const packageUsage: string = isNonBlankString(packageDescription) ? packageDescription + '.' : ''
  const repositoryName: string = resolveRepositoryName(isMonorepo, packageName)
  const repositoryHomepage: string = isMonorepo
    ? `https://github.com/${packageAuthor}/${repositoryName}/tree/main/${packageLocation}#readme`
    : `https://github.com/${packageAuthor}/${repositoryName}#readme`

  const result: INpmPackageData = {
    cwd,
    isMonorepo,
    packageName,
    packageAuthor,
    packageVersion,
    packageDescription,
    packageLocation,
    packageUsage,
    repositoryName,
    repositoryHomepage,
  }
  return result
}
