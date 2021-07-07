import invariant from '@guanghechen/invariant'
import { detectMonorepo } from '@guanghechen/npm-helper'
import {
  composeTextTransformers,
  cover,
  isNonBlankString,
  toSentenceCase,
  toTrim,
} from '@guanghechen/option-helper'
import type { TextTransformer } from '@guanghechen/option-helper'
import type { InputQuestion } from 'inquirer'
import path from 'path'
import {
  createPackageAuthorPrompt,
  createPackageDescriptionPrompt,
  createPackageLocationPrompt,
  createPackageNamePrompt,
  createPackageVersionPrompt,
} from './prompts'
import type {
  NpmPackageData,
  NpmPackagePreAnswers,
  NpmPackagePromptsAnswers,
} from './types'
import { resolveRepositoryName } from './util'

// Transformers for npm-package prompts
export const npmPackageTransformers: Record<string, TextTransformer> = {
  packageName: toTrim,
  packageAuthor: toTrim,
  packageVersion: toTrim,
  packageDescription: composeTextTransformers(toTrim, toSentenceCase),
  packageLocation: toTrim,
}

/**
 * Create a list of inquirer prompts for collecting a NpmPackagePromptsAnswers.
 *
 * @param cwd
 * @param preAnswers
 * @param defaultAnswers
 * @returns
 */
export function createNpmPackagePrompts(
  preAnswers: NpmPackagePreAnswers,
  defaultAnswers: Partial<NpmPackagePromptsAnswers> = {},
): InputQuestion<NpmPackagePromptsAnswers> {
  const prompts: InputQuestion<NpmPackagePromptsAnswers> = [
    createPackageNamePrompt(
      defaultAnswers.packageName,
      npmPackageTransformers.packageName,
    ),
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
  ]
  return prompts
}

/**
 * Resolve pre-answers.
 *
 * @param cwd
 * @param preAnswers
 * @returns
 */
export function resolveNpmPackagePreAnswers(
  preAnswers: Partial<NpmPackagePreAnswers> = {},
): NpmPackagePreAnswers {
  const cwd: string = cover<string>(
    () => path.resolve(process.cwd()),
    preAnswers.cwd,
  )

  const isMonorepo: boolean = cover<boolean>(
    () => detectMonorepo(cwd),
    preAnswers.isMonorepo,
  )

  const result: NpmPackagePreAnswers = {
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
  preAnswers: NpmPackagePreAnswers,
  answers: NpmPackagePromptsAnswers,
): NpmPackageData {
  const { cwd, isMonorepo } = preAnswers

  // Resolve prompts answers.
  const packageName: string = npmPackageTransformers.packageName(
    answers.packageName,
  )
  let packageAuthor: string = npmPackageTransformers.packageAuthor(
    answers.packageAuthor,
  )
  const packageVersion: string = npmPackageTransformers.packageVersion(
    answers.packageVersion,
  )
  const packageDescription: string = npmPackageTransformers
    .packageDescription(answers.packageDescription)
    .replace(/[.]?$/, '')
  const packageLocation: string = npmPackageTransformers.packageLocation(
    answers.packageLocation,
  )

  if (!packageAuthor) {
    const m = /^@([\w.]+)[/\\][^/\\]+$/.exec(packageName)
    if (m != null) packageAuthor = m[1]
  }

  invariant(Boolean(packageAuthor), 'Cannot resolve package author name!!')

  // Resolve additional data.
  const packageUsage: string = isNonBlankString(packageDescription)
    ? packageDescription + '.'
    : ''
  const repositoryName: string = resolveRepositoryName(isMonorepo, packageName)
  const repositoryHomepage: string = isMonorepo
    ? `https://github.com/${packageAuthor}/${repositoryName}/tree/main/${packageLocation}#readme`
    : `https://github.com/${packageAuthor}/${repositoryName}#readme`

  const result: NpmPackageData = {
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
