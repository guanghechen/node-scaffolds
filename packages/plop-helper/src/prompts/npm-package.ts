import {
  coverBoolean,
  isNotEmptyArray,
  isString,
} from '@guanghechen/option-helper'
import fs from 'fs-extra'
import type { InputQuestion } from 'inquirer'
import path from 'path'
import semverRegex from 'semver-regex'

/**
 * Answers for prompts defined in this file.
 */
export interface NpmPackagePromptsAnswers {
  /**
   * Npm package name.
   */
  packageName: string
  /**
   * Package author.
   */
  packageAuthor: string
  /**
   * Package version.
   */
  packageVersion: string
  /**
   * Package description.
   */
  packageDescription: string
  /**
   * Package usage.
   */
  packageUsage: string
  /**
   * Package location (path relative to the current directory).
   */
  packageLocation: string
  /**
   * Git repository name.
   */
  repositoryName: string
  /**
   * Git repository homepage.
   */
  repositoryHomepage: string
  /**
   * Whether if this package under a monorepo.
   */
  isMonorepo: boolean
}

export function createNpmPackagePrompts(
  cwd: string,
  defaultAnswers: Partial<NpmPackagePromptsAnswers> = {},
): InputQuestion<NpmPackagePromptsAnswers> {
  const prompts: InputQuestion<NpmPackagePromptsAnswers> = [
    {
      type: 'input',
      name: 'packageName',
      message: 'name',
      default: defaultAnswers.packageName,
      transformer: (text: string): string => text.trim(),
    },
    {
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
        return defaultAnswers.packageAuthor
      },
      transformer: (text: string): string => text.trim(),
    },
    {
      type: 'input',
      name: 'packageVersion',
      message: 'version',
      default: defaultAnswers.packageVersion,
      transformer: (text: string): string => text.trim(),
      validate: (text: string): boolean => semverRegex().test(text),
    },
    {
      type: 'input',
      name: 'packageDescription',
      message: 'description',
      default: defaultAnswers.packageDescription,
      transformer: (text: string): string =>
        text.trim().replace(/^[a-z]/, m => m.toUpperCase()),
    },
    {
      type: 'input',
      name: 'packageLocation',
      message: ({ packageName }: NpmPackagePromptsAnswers) =>
        'location of ' + packageName.trim(),
      default: (answers: NpmPackagePromptsAnswers): string => {
        const packageName = answers.packageName.trim()

        // Check if it's a monorepo.
        // eslint-disable-next-line no-param-reassign
        answers.isMonorepo = ((): boolean => {
          // detect lerna
          if (fs.existsSync(path.resolve(cwd, 'lerna.json'))) return true

          // detect yarn workspace
          const manifestFilepath = path.resolve(cwd, 'package.json')
          if (fs.existsSync(manifestFilepath)) {
            const manifest = fs.readJSONSync(manifestFilepath)
            if (isNotEmptyArray(manifest.workspace)) return true
          }

          return coverBoolean(false, defaultAnswers.isMonorepo)
        })()

        if (answers.isMonorepo) {
          const repositoryName: string = packageName.startsWith('@')
            ? /^@([^\\/]+)/.exec(packageName)![1]
            : /^([^-]+)/.exec(packageName)![1]
          // eslint-disable-next-line no-param-reassign
          answers.repositoryName = repositoryName
          return 'packages/' + packageName.replace(/^[^\\/]+[\\/]/, '')
        }

        // eslint-disable-next-line no-param-reassign
        answers.repositoryName = packageName
          .replace(/^@/, '')
          .replace('\\/', '-')
        return packageName.replace(/^@/, '')
      },
      transformer: (text: string): string => text.trim(),
    },
  ]

  return prompts
}

/**
 * Resolve answers.
 *
 * @param answers
 * @returns
 */
export function resolveNpmPackageAnswers(
  answers: NpmPackagePromptsAnswers,
): NpmPackagePromptsAnswers {
  const packageName: string = answers.packageName.trim()
  const packageAuthor: string = answers.packageAuthor.trim()
  const packageVersion: string = answers.packageVersion.trim()
  const packageDescription: string = answers.packageDescription
    .trim()
    .replace(/^[a-z]/, m => m.toUpperCase())
    .replace(/[.]?$/, '')
  const packageUsage: string = packageDescription
    ? packageDescription + '.'
    : ''
  const packageLocation: string = answers.packageLocation.trim()
  const repositoryName: string = answers.repositoryName.trim()
  const isMonorepo: boolean = answers.isMonorepo
  const repositoryHomepage: string = answers.isMonorepo
    ? `https://github.com/${packageAuthor}/${repositoryName}/tree/master/${packageLocation}#readme`
    : `https://github.com/${packageAuthor}/${repositoryName}#readme`

  const result: NpmPackagePromptsAnswers = {
    packageName,
    packageAuthor,
    packageVersion,
    packageDescription,
    packageUsage,
    packageLocation,
    repositoryName,
    repositoryHomepage,
    isMonorepo,
  }
  return result
}
